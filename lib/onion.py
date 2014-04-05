import requests
import json

class OnionooError(Exception):
  pass

def query(resource, params):
  if not resource in ['summary', 'details', 'bandwidth', 'weights',
                      'clients', 'uptime']:
    raise OnionooError('Invalid query (Unknown document)')

  url = 'https://onionoo.torproject.org/%s' % (resource,)

  r = requests.get(url, params=params)
  if r.status_code == 200:
    return r.json
  else:
    raise OnionooError('Onionoo replied with error: %s (%s)' % (
                       r.status_code, r.reason))

def download_documents(resource_name, fingerprints):
  downloads = []
  for fingerprint in fingerprints:
    doc = query(resource_name, {'lookup':fingerprint})
    downloads.append(doc)
  return downloads
