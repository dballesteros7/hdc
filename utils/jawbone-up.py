from datetime import date
import json
import os

from requests_oauthlib import OAuth2Session


no_token = True
client_id = r'5g4X_c17R8Y'
client_secret = r'a749135658a3a9ca5cd76169a6fb365f'
redirect_uri = 'https://localhost:8080/redirect/jawbone-up'
scope = ['basic_read extended_read location_read friends_read '
         'mood_read move_read sleep_read meal_read weight_read '
         'cardiac_read generic_event_read']
home = '/tmp/hdc/'

sleep_list_url = 'https://jawbone.com/nudge/api/v.1.1/users/@me/sleeps'
sleep_ticks_url = 'https://jawbone.com/nudge/api/v.1.1/sleeps/%s/ticks'
move_list_url = 'https://jawbone.com/nudge/api/v.1.1/users/@me/moves'
move_ticks_url = 'https://jawbone.com/nudge/api/v.1.1/moves/%s/ticks'
meal_list_url = 'https://jawbone.com/nudge/api/v.1.1/users/@me/meals'


if no_token:
    jawbone_up = OAuth2Session(client_id, redirect_uri=redirect_uri,
                               scope=scope)
    authorization_url, state = jawbone_up.authorization_url(
                                        'https://jawbone.com/auth/oauth2/auth')

    print 'Please go to link below and authorize access.\n%s ' % authorization_url

    authorization_response = raw_input('Enter the full callback URL:\n')

    token = jawbone_up.fetch_token('https://jawbone.com/auth/oauth2/token',
                                   authorization_response=authorization_response,
                                   client_secret=client_secret)

    print 'Please update the token.\n %s' % token.get(u'access_token')
    print 'Please update the refresh token.\n %s' % token.get(u'refresh_token')
else:
    access_token = 'b6_3pfGGwEgiSSivKqnmQfFK59dIENPZrQgq9fo9MosBIJirwCCGrd86BCNCwDk0ckgNEEjEXsdBvBmPfMJql1ECdgRlo_GULMgGZS0EumxrKbZFiOmnmAPChBPDZ5JP'
    refresh_token = 'oAiwG8gfPrCLpr_xOljdZrRWJfxTwsW1gltsDCH6KQvdL2WxNgQvKekaCy5aBtavNNWfJhnfRQwlAN2iCODyqw'
    jawbone_up = OAuth2Session(client_id,
                               token={'refresh_token': refresh_token,
                                      'access_token': access_token})


def get_move_data(query_date):
    response = jawbone_up.get(move_list_url,
                              params={'date': query_date.strftime('%Y%m%d')})
    result = response.json()

    out_file = open(home + 'move-list-%s.json' % query_date, 'w')
    json.dump(result, out_file, indent=4)
    out_file.close()

    for item in result['data']['items']:
        xid = item['xid']
        response = jawbone_up.get(move_ticks_url % xid)
        result = response.json()

        out_file = open(home + 'move-ticks-%s.json' % query_date, 'w')
        json.dump(result, out_file, indent=4)
        out_file.close()


def get_sleep_data(query_date):
    response = jawbone_up.get(sleep_list_url,
                              params={'date': query_date.strftime('%Y%m%d')})
    result = response.json()

    out_file = open(home + 'sleep-list-%s.json' % query_date, 'w')
    json.dump(result, out_file, indent=4)
    out_file.close()

    for item in result['data']['items']:
        xid = item['xid']
        response = jawbone_up.get(sleep_ticks_url % xid)
        result = response.json()

        out_file = open(home + 'sleep-ticks-%s.json' % query_date, 'w')
        json.dump(result, out_file, indent=4)
        out_file.close()


def get_meal_data(query_date):
    response = jawbone_up.get(meal_list_url,
                              params={'date': query_date.strftime('%Y%m%d')})
    result = response.json()

    out_file = open(home + 'meal-list-%s.json' % query_date, 'w')
    json.dump(result, out_file, indent=4)
    out_file.close()


year = 2014
month = 3
os.system('mkdir -p ' + home)
for day in xrange(1, 32):
    date_to_get = date(year, month, day)
    print 'Fetching data on date %s' % date_to_get

    get_sleep_data(date_to_get)
    get_move_data(date_to_get)
    get_meal_data(date_to_get)

print 'Finished fetching data'
