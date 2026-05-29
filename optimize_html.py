import sys

def optimize_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add loading="lazy" to all imgs
    content = content.replace('<img ', '<img loading="lazy" ')
    
    # Revert hero avatar
    content = content.replace('<img loading="lazy" src="assets/avatar.png"', '<img src="assets/avatar.png"')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == '__main__':
    optimize_html('index.html')
    print("Done")
