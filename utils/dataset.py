"""
dataset.py
Dataset creation utilities for Easy Voice Cloner.
"""
import torch
from torch.utils.data import Dataset

class VoiceDataset(Dataset):
    """Simple dataset for audio and transcript pairs."""
    def __init__(self, audio_files, transcripts):
        self.audio_files = audio_files
        self.transcripts = transcripts

    def __len__(self):
        return len(self.audio_files)

    def __getitem__(self, idx):
        audio = torch.tensor([])  # TODO: Load and process audio
        text = self.transcripts[idx]
        return audio, text
