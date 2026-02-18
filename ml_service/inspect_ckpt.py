import torch, pprint
p = "outputs/best_model.pth"
ckpt = torch.load(p, map_location="cpu")
print("TYPE:", type(ckpt))
if isinstance(ckpt, dict):
    print("keys:", list(ckpt.keys()))
    if "args" in ckpt:
        print("CKPT ARGS:")
        pprint.pprint(ckpt["args"])
    if "model_state_dict" in ckpt:
        print("STATE DICT SAMPLE KEYS:", list(ckpt["model_state_dict"].keys())[:40])
else:
    print("STATE DICT SAMPLE KEYS:", list(ckpt.keys())[:40])
