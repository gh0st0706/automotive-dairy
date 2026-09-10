import os
import subprocess
import sys
import webbrowser

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))


def main():
    print('Opening Maruti 800 Engineering Project...')
    for path in [
        os.path.join(PROJECT_DIR, 'PROJECT.md'),
        os.path.join(PROJECT_DIR, 'docs', 'SUBSYSTEM_MAP.md'),
        os.path.join(PROJECT_DIR, 'model'),
    ]:
        try:
            if os.path.isdir(path):
                os.startfile(path)
            else:
                os.startfile(path)
        except Exception as e:
            print(f'Could not open {path}: {e}')

    webbrowser.open('file://' + os.path.join(PROJECT_DIR, 'PROJECT.md').replace('\\', '/'))
    print('Done.')

if __name__ == '__main__':
    main()
