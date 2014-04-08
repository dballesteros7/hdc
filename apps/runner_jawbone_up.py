import json
import os
import urllib

import cherrypy
import requests
from requests_oauthlib import OAuth2Session

_APP_NAME = 'jawbone-up'
_CLIENT_ID = '5g4X_c17R8Y'
_CLIENT_SECRET = '85da2f8450cb8e0f2d9ee352a98f8a58f9f8a0e4'
_REDIRECT_URI = 'h'
_AUTHORIZATION_BASE_URL = 'https://jawbone.com/auth/oauth2/auth'
_TOKEN_URL = 'https://jawbone.com/auth/oauth2/token'
_SCOPE = ['basic_read extended_read location_read friends_read mood_read move_read sleep_read meal_read weight_read cardiac_read generic_event_read']

@cherrypy.tools.json_out()
def proxy(url_encoded):
    decoded_url = urllib.unquote(url_encoded)
    response = requests.get(decoded_url,
                            headers = {'Authorization' : cherrypy.request.headers['Authorization']})
    cherrypy.response.status = response.status_code
    return response.json()

@cherrypy.tools.json_out()
def authorize_with_jawbone_up(reply_to):
    oauth = OAuth2Session(client_id=_CLIENT_ID, redirect_uri=_REDIRECT_URI,
                          scope=_SCOPE)
    authorization_url, state = oauth.authorization_url(_AUTHORIZATION_BASE_URL)
    print 'Please go here and authorize,', authorization_url
    

if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.join(current_dir, _APP_NAME)
    d = cherrypy.dispatch.RoutesDispatcher()
    d.connect(name="proxy", route="/proxy", controller=proxy,
              conditions=dict(method=["GET"]))
    d.connect(name="jawbone-up-step1", route="/authorize/jawboneUp", controller=authorize_with_jawbone_up,
              conditions=dict(method=["GET"]))
    cherrypy.config.update({'log.error_file': 'site.log',
                            'log.screen': True,
                            'server.thread_pool' : 20,
                            'server.ssl_module' : 'builtin',
                            'server.ssl_certificate' : 'cert.pem',
                            'server.ssl_private_key' : 'privkey.pem'})
    conf = {'/js': {'tools.staticdir.on': True,
                      'tools.staticdir.dir': os.path.join(app_dir, 'js'),
                      'tools.staticdir.content_types' : {'js' : 'text/javascript'}},
            '/views': {'tools.staticdir.on': True,
                      'tools.staticdir.dir': os.path.join(app_dir, 'views')},
            '/assets': {'tools.staticdir.on': True,
                      'tools.staticdir.dir': os.path.join(app_dir, 'assets')},
            '/index' : {'tools.staticfile.on' : True,
                        'tools.staticfile.filename' : os.path.join(app_dir, 'index.html')},
            '/' : {'request.dispatch' : d}
            }
    cherrypy.tree.mount(root=None, config=conf)
    cherrypy.engine.start()
    cherrypy.engine.block()
