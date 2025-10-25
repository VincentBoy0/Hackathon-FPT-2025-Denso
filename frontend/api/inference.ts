import { apiPost2 } from "@/lib/api";

export async function get_inference_results(image_path: string) {
    try {
        const data = await apiPost2(`/inference`, image_path);
        return data;
    } catch (error) {
        console.error('Error fetching inference results:', error);
        return null;
    }
}