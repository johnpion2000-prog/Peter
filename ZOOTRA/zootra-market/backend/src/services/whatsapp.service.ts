import axios from 'axios';

class WhatsAppService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/send';
    }

    public async sendMessage(to: string, message: string): Promise<any> {
        try {
            const response = await axios.post(this.apiUrl, {
                to,
                message
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to send message: ${(error as any).message}`);
        }
    }

    public async getChatHistory(userId: string): Promise<any> {
        try {
            const response = await axios.get(`${this.apiUrl}/history/${userId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch chat history: ${(error as any).message}`);
        }
    }
}

export default new WhatsAppService();