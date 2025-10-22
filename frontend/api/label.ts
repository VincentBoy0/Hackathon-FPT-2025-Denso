import { apiGet, apiPost, apiDelete } from "@/lib/api";

export async function get_all_labels() {
    try {
        const data = await apiGet('/label');
        return data;
    } catch (error) {
        console.error('error fetching labels:', error);
        return [];
    }
}

export async function get_all_label_names(): Promise<string[]> {
    const labels = await get_all_labels();
    if (!Array.isArray(labels)) return [];
    return labels.map((l: any) => l.name).filter(Boolean);
}

// Add this interface at the top of the file
interface LabelForm {
    name: string;
    solution?: string;  // Optional field marked with ?
}

export async function add_new_label(name: string, solution: string | null) {
    try {
        const payload = { name, solution: solution ?? undefined };  // changed
        const response = await apiPost('/label', payload);
        return response;
    } catch (error) {
        console.error('error adding new label:', error);
        throw error;  // Re-throw to handle in the UI layer
    }
}

export async function delete_label(id: number) {
    try {
        const response = await apiDelete(`/label/${id}`); // or adapt to your API shape
        return response;
    } catch (error) {
        console.error('error deleting label:', error);
        throw error;
    }
}
