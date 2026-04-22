import axios from 'axios';

class SMSService {
    private apiUrl: string;
    private apiKey: string;

    constructor() {
        this.apiUrl = process.env.SMS_API_URL || 'https://api.smsprovider.com/send';
        this.apiKey = process.env.SMS_API_KEY || 'your_api_key_here';
    }

    public async sendSMS(to: string, message: string): Promise<void> {
        try {
            const response = await axios.post(this.apiUrl, {
                to,
                message,
                apiKey: this.apiKey,
            });

            if (response.status !== 200) {
                throw new Error('Failed to send SMS');
            }
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }
}

export default new SMSService();