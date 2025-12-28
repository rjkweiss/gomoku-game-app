class ApiService {
    async getAllUsers() {
        const response = await fetch('/api/users', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.error || 'Failed to fetch users');
        }

        return result;
    };
}

export const api = new ApiService();
