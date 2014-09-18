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
    weights_documents = fetch_documents('weights', fingerprints,
                                        options.base_url)
    fingerprints, weights_documents = retain_only_new_or_faster(
                                      fingerprints, weights_documents,
                                      options.cutoff_datetime,
                                      options.min_raise)
    details_documents = fetch_documents('details', fingerprints,
                                        options.base_url)
    write_fingerprints(options.out_fingerprints, details_documents)
    bandwidth_documents = fetch_documents('bandwidth', fingerprints,
                                          options.base_url)
    remove_csv_file(options.out_csv)
    combine_and_write_documents(options.out_bandwidth, options.out_csv,
                                bandwidth_documents,
                                options.addonly_datetime)
    sum_up_written_bytes(options.out_bytes, bandwidth_documents,
                         options.cutoff_datetime)
    combine_and_write_documents(options.out_weights, options.out_csv,
                                weights_documents,
                                options.addonly_datetime)
    clients_documents = fetch_documents('clients', fingerprints,
                                        options.base_url)
    combine_and_write_documents(options.out_clients, options.out_csv,
                                clients_documents,
                                options.addonly_datetime)
    uptime_documents = fetch_documents('uptime', fingerprints,
                                       options.base_url)
    combine_and_write_documents(options.out_uptime, options.out_csv,
                                uptime_documents, None)

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
    parser.add_option('-s', action='store', dest='cutoff_datetime',
                      default='2014-06-05 00:00:00', metavar='DATETIME',
                      help='date-time when the challenge starts, only '
                           'relevant for transferred bytes document '
                           '[default: %default, '
                           'format: \%Y-\%m-\%d \%H:\%M:\%S]')
    parser.add_option('-a', action='store', dest='addonly_datetime',
                      default=None, metavar='DATETIME',
                      help='if set, only include bandwidth, weights, and '
                           'clients values in combined document files '
                           'starting at this date time, and after '
                           'subtracting maximum values from before this '
                           'date time ' '[default: %default, '
                           'format: \%Y-\%m-\%d \%H:\%M:\%S]')
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
    parser.add_option('-o', action='store', dest='base_url',
                      default='https://onionoo.torproject.org/',
                      metavar='URL',
                      help='download from this Onionoo instance '
                           '[default: %default]')
    parser.add_option('-m', action='store', dest='min_raise',
                      default='128000', metavar='BW',
                      help='minimum increase in advertised bandwidth in '
                           'B/s that existing relays must have to be '
                           'considered in the challenge [default: '
                           '%default]')
    parser.add_option('-v', action='store', dest='out_csv',
                      default='combined.csv', metavar='FILE',
                      help='write combined document contents as '
                           'comma-separated value file [default: '
                           '%default]')
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

def fetch_documents(resource_name, fingerprints, base_url):
    # TODO put me in after testing
    return download_documents(resource_name, fingerprints, base_url)
    #return read_documents_from_disk(resource_name, fingerprints)

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

def remove_csv_file(out_csv_path):
    if os.path.exists(out_csv_path):
        os.remove(out_csv_path)

def combine_and_write_documents(out_json_path, out_csv_path, downloads,
                                addonly_datetime):
    addonly = None
    if addonly_datetime:
        addonly = datetime.strptime(addonly_datetime, '%Y-%m-%d %H:%M:%S')
    combined_document = combine_downloads(downloads, addonly)
    write_combined_document_to_disk(out_json_path, out_csv_path,
                                    combined_document)

def combine_downloads(downloads, addonly):
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
    return combine_documents(documents, addonly)

def combine_documents(documents, addonly):
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
        combined_document[key] = combine_graphs(value, addonly)
    return combined_document

def combine_graphs(graphs, addonly):
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
        combined_history = combine_histories(key, value, addonly)
        if combined_history:
            combined_graph[key] = combined_history
    return combined_graph

time_periods = {'3_days':3, '1_week':7, '1_month':31, '3_months':92,
                '1_year':366, '5_years':1830}

def combine_histories(time_period, histories, addonly):
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
        max_before = 0
        for value in history['values']:
            if value:
                denormalized_value = value * history['factor']
                if addonly:
                    if current < addonly:
                        if denormalized_value > max_before:
                            max_before = denormalized_value
                        denormalized_value = None
                    elif denormalized_value < max_before:
                        denormalized_value = None
                    else:
                        denormalized_value -= max_before
                if denormalized_value:
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
    combined_history['first'] = str(new_first)
    combined_history['last'] = str(new_last)
    combined_history['interval'] = new_interval
    combined_history['factor'] = new_factor
    combined_history['count'] = len(new_normalized_values)
    combined_history['values'] = new_normalized_values
    return combined_history

def write_combined_document_to_disk(out_json_path, out_csv_path,
                                    combined_document):
    write_combined_json_to_disk(out_json_path, combined_document)
    append_to_combined_csv(out_csv_path, combined_document)

def write_combined_json_to_disk(out_path, combined_document):
    out_file = open(out_path, 'w')
    out_file.write(json.dumps(combined_document))
    out_file.close()

def append_to_combined_csv(out_path, combined_document):
    out_file = open(out_path, 'a')
    for graph_name, histories in combined_document.iteritems():
        if graph_name == 'fingerprints':
            continue
        for interval, history in histories.iteritems():
            if 'interval' in history and 'first' in history and \
               'values' in history and 'factor' in history:
                current = datetime.strptime(history['first'],
                                            '%Y-%m-%d %H:%M:%S')
                for value in history['values']:
                    if value:
                        denormalized_value = value * history['factor']
                        out_file.write('%s,%s,%s,%f\n' %
                                       (graph_name, interval,
                                        str(current), denormalized_value))
                    current += timedelta(seconds=history['interval'])
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

def sum_up_written_bytes(out_path, bandwidth_documents,
                         cutoff_datetime=None):
    if cutoff_datetime:
        cutoff = datetime.strptime(cutoff_datetime, '%Y-%m-%d %H:%M:%S')
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
            if 'interval' in value and 'first' in value and \
                 'values' in value and 'factor' in value:
                total = 0
                current = datetime.strptime(value['first'],
                                            '%Y-%m-%d %H:%M:%S')
                interval = timedelta(seconds=value['interval'])
                for val in value['values']:
                    if val and (not cutoff or current >= cutoff):
                        total = total + val
                    current = current + interval
                total = int(total * value['interval'] * value['factor'])
                if total > max_written_bytes_relay:
                    max_written_bytes_relay = total
        total_written_bytes += max_written_bytes_relay
    document = {}
    document['total_written_bytes'] = total_written_bytes
    out_file = open(out_path, 'w')
    out_file.write(json.dumps(document))
    out_file.close()

def retain_only_new_or_faster(fingerprints, weights_documents,
                              start_datetime, min_raise_str):
    result_fingerprints = list(fingerprints)
    result_weights_documents = []
    start = datetime.strptime(start_datetime, '%Y-%m-%d %H:%M:%S')
    min_raise = int(min_raise_str)
    for weights_document in weights_documents:
        retain = True
        if 'relays' in weights_document:
            for relay in weights_document['relays']:
                if 'fingerprint' in relay and \
                   'advertised_bandwidth' in relay:
                    fingerprint = relay['fingerprint']
                    advbw = relay['advertised_bandwidth']
                    max_before, max_after = -1, -1
                    for advbw in relay['advertised_bandwidth'].values():
                        if 'interval' in advbw and 'first' in advbw and \
                           'values' in advbw and 'factor' in advbw:
                            current = datetime.strptime(advbw['first'],
                                      '%Y-%m-%d %H:%M:%S')
                            interval = timedelta(
                                       seconds=advbw['interval'])
                            factor = advbw['factor']
                            for val in advbw['values']:
                                if val:
                                    value = val * factor
                                    if current < start and \
                                       value > max_before:
                                        max_before = value
                                    elif current >= start and \
                                         value > max_after:
                                        max_after = value
                                current = current + interval
                    if max_before > -1 and \
                       max_after - min_raise < max_before:
                        result_fingerprints.remove(fingerprint)
                        retain = False
        if retain:
            result_weights_documents.append(weights_document)
    return result_fingerprints, result_weights_documents

if __name__ == '__main__':
    main()


