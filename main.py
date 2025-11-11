import json
import re
import os

item_image_dir = "./public/items"


def get_image_names(dir: str) -> list[str]:
    w = list(os.walk(item_image_dir))
    filenames = w[0][2]
    return filenames


# Remove schematic icons
image_names = get_image_names(item_image_dir)
delete_list = [i for i in image_names if i.startswith("schematic-")]
for d in delete_list:
    os.remove(item_image_dir + "/" + d)

# Remove resource sink icons
image_names = get_image_names(item_image_dir)
delete_list = [i for i in image_names if i.startswith("resourcesink-")]
for d in delete_list:
    os.remove(item_image_dir + "/" + d)

# Remove MAM tree icons
image_names = get_image_names(item_image_dir)
delete_list = [i for i in image_names if i.startswith("research-")]
for d in delete_list:
    os.remove(item_image_dir + "/" + d)

# Remove 64x64 icons icons
image_names = get_image_names(item_image_dir)
delete_list = [i for i in image_names if i.endswith("64.png")]
for d in delete_list:
    os.remove(item_image_dir + "/" + d)

image_names = get_image_names(item_image_dir)
with open("bruh.json", "w") as f:
    json.dump(image_names, f, indent=2)
