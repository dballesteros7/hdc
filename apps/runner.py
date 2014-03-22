import cherrypy
import os
import requests
import urllib

_APP_NAME = 'nikeplus'

@cherrypy.tools.json_out()
def proxy(url_encoded):
    decoded_url = urllib.unquote(url_encoded)
    response = requests.get(decoded_url, headers = cherrypy.request.headers)
    # Strip the content-length from response headers
    del response.headers['content-length']
    cherrypy.response.headers.update(response.headers)
    cherrypy.response.status = response.status_code
    return response.json()

if __name__ == '__main__':
    current_dir = os.path.dirname(os.path.abspath(__file__))
    app_dir = os.path.join(current_dir, _APP_NAME)
    d = cherrypy.dispatch.RoutesDispatcher()
    d.connect(name = "proxy", route = "/proxy", controller = proxy,
              conditions = dict(method = ["GET"]))
    cherrypy.config.update({'log.error_file': 'site.log',
                            'log.screen': True})
    conf = {'/js': {'tools.staticdir.on': True,
                      'tools.staticdir.dir': os.path.join(app_dir, 'js'),
                      'tools.staticdir.content_types' : {'js' : 'text/javascript'}},
            '/views': {'tools.staticdir.on': True,
                      'tools.staticdir.dir': os.path.join(app_dir, 'views')},
            '/index' : {'tools.staticfile.on' : True,
                        'tools.staticfile.filename' : os.path.join(app_dir, 'index.html')},
            '/' : {'request.dispatch' : d}
            }
    cherrypy.tree.mount(root = None, config = conf)
    cherrypy.engine.start()
    cherrypy.engine.block()
