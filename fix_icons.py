with open('frontend/src/pages/AdminWeb.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the import block and fix duplicate Globes
old = "  Globe,\n  Globe,\n  Globe,"
new = "  Globe,"
content = content.replace(old, new)

with open('frontend/src/pages/AdminWeb.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
count = content.count("  Globe,")
print(f"Globe imports remaining: {count}")

