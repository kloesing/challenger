#!/usr/bin/env python
import json
import optparse
import os
import sys
from datetime import timedelta, datetime
from lib.onion import download_documents


def main():
    options = parse_options()
    fingerprints = read_fingerprints(options.in_fingerprints)
    details_documents = fetch_documents('details', fingerprints)
    write_fingerprints(options.out_fingerprints, details_documents)
    bandwidth_documents = fetch_documents('bandwidth', fingerprints)
    combine_and_write_documents(options.out_bandwidth, bandwidth_documents)
    sum_up_written_bytes(options.out_bytes, bandwidth_documents)
    weights_documents = fetch_documents('weights', fingerprints)
    combine_and_write_documents(options.out_weights, weights_documents)
    clients_documents = fetch_documents('clients', fingerprints)
    combine_and_write_documents(options.out_clients, clients_documents)
    uptime_documents = fetch_documents('uptime', fingerprints)
    combine_and_write_documents(options.out_uptime, uptime_documents)

def parse_options():
    parser = optparse.OptionParser()
    parser.add_option('-f', action='store', dest='in_fingerprints',
                      default='fingerprints.txt', metavar='FILE',
                      help='read relay fingerprints and/or hashed bridge '
                           'fingerprint as input [default: %default]')
    parser.add_option('-t', action='store', dest='out_bytes',
                      default='transferred-bytes.json', metavar='FILE',
                      help='write transferred bytes document as output '
                           '[default: %default]')
    parser.add_option('-b', action='store', dest='out_bandwidth',
                      default='combined-bandwidth.json', metavar='FILE',
                      help='write combined bandwidth document as output '
                           '[default: %default]')
    parser.add_option('-w', action='store', dest='out_weights',
                      default='combined-weights.json', metavar='FILE',
                      help='write combined weights document as output '
                           '[default: %default]')
    parser.add_option('-u', action='store', dest='out_uptime',
                      default='combined-uptime.json', metavar='FILE',
                      help='write combined uptime document as output '
                           '[default: %default]')
    parser.add_option('-c', action='store', dest='out_clients',
                      default='combined-clients.json', metavar='FILE',
                      help='write combined clients document as output '
                           '[default: %default]')
    parser.add_option('-p', action='store', dest='out_fingerprints',
                      default='fingerprints.json', metavar='FILE',
                      help='write fingerprints document as output '
                           '[default: %default]')
    (options, args) = parser.parse_args()
    return options

def read_fingerprints(fingerprints_path):
    if not os.path.exists(fingerprints_path):
        print('Fingerprints file %s does not exist.  Exiting.' % (
               fingerprints_path, ))
        sys.exit(1)
    fingerprints_file = open(fingerprints_path)
    fingerprints_content = fingerprints_file.read()
    fingerprints_file.close()
    fingerprints = []
    for line in fingerprints_content.split('\n'):
        if '#' in line:
            stripped_line = line[:line.index('#')].strip()
        else:
            stripped_line = line.strip()
        if len(stripped_line) == 40:
            fingerprints.append(stripped_line)
        elif len(stripped_line) > 0:
            print('Skipping invalid fingerprint: %s' % (stripped_line, ))
    return fingerprints

def fetch_documents(resource_name, fingerprints):
    # TODO put me in after testing
    #return download_documents(resource_name, fingerprints)
    return read_documents_from_disk(resource_name, fingerprints)

def read_documents_from_disk(resource_name, fingerprints):
    # TODO Take me out after testing
    downloads = []
    for fingerprint in fingerprints:
        document_path = '%s/%s' % (resource_name, fingerprint, )
        if os.path.exists(document_path):
            document_file = open(document_path)
            document_content = document_file.read()
            document_file.close()
            downloads.append(json.loads(document_content))
    return downloads

def combine_and_write_documents(out_path, downloads):
    combined_document = combine_downloads(downloads)
    write_combined_document_to_disk(out_path, combined_document)

def combine_downloads(downloads):
    """
    Combine an arbitrary number of downloaded Onionoo documents consisting
    of four fields:
     - relays_published (string): ignored here
     - relays (array of objects): contains zero or more documents
     - bridges_published (string): ignored here
     - bridges (array of objects): contains zero or more documents
    Return a single document with graphs containing data from all relays
    and bridges.
    """
    documents = []
    for download_dict in downloads:
        documents.extend(download_dict['relays'])
        documents.extend(download_dict['bridges'])
    return combine_documents(documents)

def combine_documents(documents):
    """
    Combine one or more relay or bridge documents into a single document
    with the following fields:
     - fingerprints (array of strings)
     - (all combined graphs contained in relay or bridge documents)
    """
    fingerprints = []
    graphs = {}
    for document in documents:
        for key, value in document.iteritems():
            if key == 'fingerprint':
                fingerprints.append(value)
            elif key in graphs:
                graphs[key].append(value)
            else:
                graphs[key] = [value]
    combined_document = {}
    combined_document['fingerprints'] = fingerprints
    for key, value in graphs.iteritems():
        combined_document[key] = combine_graphs(value)
    return combined_document

def combine_graphs(graphs):
    """
    Combine one or more sets of graphs into a single set of graphs.
    """
    histories = {}
    for graph in graphs:
        for key, value in graph.iteritems():
            if key in histories:
                histories[key].append(value)
            else:
                histories[key] = [value]
    combined_graph = {}
    for key, value in histories.iteritems():
        combined_history = combine_histories(key, value)
        if combined_history:
            combined_graph[key] = combined_history
    return combined_graph

time_periods = {'3_days':3, '1_week':7, '1_month':31, '3_months':92,
                '1_year':366, '5_years':1830}

def combine_histories(time_period, histories):
    """
    Combine an arbitrary number of graphs for a given time period into a
    single graph.  The combined graph will range from max(first) to
    max(last) of input graphs.
    """
    first, last, interval = [], [], []
    values = {}
    for history in histories:
        first.append(history['first'])
        last.append(history['last'])
        interval.append(history['interval'])
        factor = history['factor']
        current = datetime.strptime(history['first'], '%Y-%m-%d %H:%M:%S')
        for value in history['values']:
            if value:
                denormalized_value = value * history['factor']
                if current in values:
                    values[current].append(denormalized_value)
                else:
                    values[current] = [denormalized_value]
            current = current + timedelta(seconds=history['interval'])
    new_first, new_last = None, None
    new_interval = max(interval)
    new_current = datetime.strptime(min(first), '%Y-%m-%d %H:%M:%S')
    last_last = datetime.strptime(max(last), '%Y-%m-%d %H:%M:%S')
    new_denormalized_values = []
    new_max = 0
    cutoff = datetime.now() - timedelta(days=time_periods[time_period])
    while new_current <= last_last:
        if new_current < cutoff:
            pass
        elif new_current in values:
            new_value = sum(values[new_current])
            new_denormalized_values.append(new_value)
            if new_value > new_max:
                new_max = new_value
            if not new_first:
                new_first = new_current
            new_last = new_current
        else:
            new_denormalized_values.append(None)
        new_current = new_current + timedelta(seconds=new_interval)
    if not new_denormalized_values:
        return None
    new_factor = new_max / 999.0
    new_normalized_values = []
    for value in new_denormalized_values:
        if value:
            new_normalized_values.append(int(value / new_factor))
        else:
            new_normalized_values.append(None)
    combined_history = {}
    combined_history['first'] = max(first)
    combined_history['last'] = max(last)
    combined_history['interval'] = new_interval
    combined_history['factor'] = new_factor
    combined_history['count'] = len(new_normalized_values)
    combined_history['values'] = new_normalized_values
    return combined_history

def write_combined_document_to_disk(out_path, combined_document):
    out_file = open(out_path, 'w')
    out_file.write(json.dumps(combined_document))
    out_file.close()

def write_fingerprints(out_path, details_documents):
    documents = []
    for details in details_documents:
        documents.extend(details['relays'])
        documents.extend(details['bridges'])
    new_nodes = []
    for details in documents:
        new_node = {}
        if 'fingerprint' in details:
            new_node['fingerprint'] = details['fingerprint']
        elif 'hashed_fingerprint' in details:
            new_node['fingerprint'] = details['hashed_fingerprint']
        else:
            continue
        if 'nickname' in details:
            new_node['nickname'] = details['nickname']
        else:
            new_node['nickname'] = 'Unnamed'
        new_nodes.append(new_node)
    out_file = open(out_path, 'w')
    out_file.write(json.dumps(new_nodes))
    out_file.close()

def sum_up_written_bytes(out_path, bandwidth_documents):
    write_histories = []
    for document in bandwidth_documents:
        for relay in document['relays']:
            if 'write_history' in relay:
                write_histories.append(relay['write_history'])
        for bridge in document['bridges']:
            if 'write_history' in bridge:
                write_histories.append(bridge['write_history'])
    total_written_bytes = 0
    for write_history in write_histories:
        max_written_bytes_relay = 0
        for key, value in write_history.iteritems():
            if 'interval' in value and 'values' in value and \
                 'factor' in value:
                total = 0
                for val in value['values']:
                    if val: total = total + val
                total = int(total * value['interval'] * value['factor'])
                if total > max_written_bytes_relay:
                    max_written_bytes_relay = total
        total_written_bytes += max_written_bytes_relay
    document = {}
    document['total_written_bytes'] = total_written_bytes
    out_file = open(out_path, 'w')
    out_file.write(json.dumps(document))
    out_file.close()

if __name__ == '__main__':
    main()


