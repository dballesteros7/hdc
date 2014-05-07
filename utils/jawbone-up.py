from datetime import date
import json

from requests_oauthlib import OAuth2Session


no_token = False
client_id = r'5g4X_c17R8Y'
client_secret = r'a749135658a3a9ca5cd76169a6fb365f'
redirect_uri = 'https://localhost:8080/redirect/jawbone-up'
scope = ['basic_read extended_read location_read friends_read '
         'mood_read move_read sleep_read meal_read weight_read '
         'cardiac_read generic_event_read']
home = '/tmp/'

if no_token:
    jawboneup = OAuth2Session(client_id, redirect_uri=redirect_uri,
                          scope=scope)
    authorization_url, state = jawboneup.authorization_url(
                                        'https://jawbone.com/auth/oauth2/auth')

    print 'Please go to link below and authorize access.\n%s ' % authorization_url

    authorization_response = raw_input('Enter the full callback URL:\n')

    token = jawboneup.fetch_token('https://jawbone.com/auth/oauth2/token',
                                  authorization_response=authorization_response,
                                  client_secret=client_secret)

    print 'Please update the token.\n %s' % token.get(u'access_token')
    print 'Please update the refresh token.\n %s' % token.get(u'refresh_token')
else:
    access_token = 'b6_3pfGGwEgiSSivKqnmQfFK59dIENPZrQgq9fo9MosBIJirwCCGrd86BCNCwDk0ckgNEEjEXsdBvBmPfMJql1ECdgRlo_GULMgGZS0EumxrKbZFiOmnmAPChBPDZ5JP'
    refresh_token = 'oAiwG8gfPrCLpr_xOljdZrRWJfxTwsW1gltsDCH6KQvdL2WxNgQvKekaCy5aBtavNNWfJhnfRQwlAN2iCODyqw'
    jawboneup = OAuth2Session(client_id, token={'refresh_token' : refresh_token,
                                                'access_token' : access_token})


def get_sleep(query_date):
    r = jawboneup.get('https://jawbone.com/nudge/api/v.1.1/users/@me/sleeps',
                      params={'date' : query_date.strftime('%Y%m%d')})
    base_result = r.json()
    for item in base_result['data']['items']:
        xid = item['xid']
        extra = jawboneup.get(
                    'https://jawbone.com/nudge/api/v.1.1/sleeps/%s/ticks' % xid)
        base_result[xid] = extra.json()
    return base_result

for val in xrange(1, 32):
    out_file = open(home + 'sleep03%s' % val, 'w');
    json.dump(get_sleep(date(2014, 3, val)), out_file)
    out_file.close()
