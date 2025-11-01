from enum import Enum

class ImageStatus(str, Enum):
    ready = "Ready"
    progress = "Progress"
    review = "Review"
    approve = "Approve"
