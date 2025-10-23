import { apiGet, apiPost1, apiPost } from "@/lib/api";

export async function get_all_images() {
    try {
        const data = await apiGet('/image/');
        return data;
    } catch (error) {
        console.error('error fetching labels:', error);
        return [];
    }
}

// export async function get_images_by_label_id() {
//     try {
//         const data = 
//     }
// }


enum ImageStatus {
    Ready = "Ready",
    Progress = "Progress",
    Review = "Review",
    Approve = "Approve"
}

export async function upload_new_image(img: FormData) {
    try {
        const response = await apiPost1('/upload/', img);
        return response;
    }
    catch (error) {
        console.error('error uploading image:', error);
        return [];
    }
}

interface BoundingBox {
  x: number;
  y: number;
  w: number;
  h: number;
}
export async function upload_annotation(image_id: number, label_id: number, bounding_box: BoundingBox) {
    try {
        const payload = {image_id, label_id, bounding_box};
        const response = await apiPost('/annotation/', payload);
        return response;
    }
    catch (error) {
        console.log("error uploading annotation: ", error);
        return null;
    }
}