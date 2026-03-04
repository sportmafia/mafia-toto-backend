from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class LocalHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
    }


def main() -> None:
    server = ThreadingHTTPServer(('0.0.0.0', 8000), LocalHandler)
    print('Serving current directory on http://localhost:8000')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
