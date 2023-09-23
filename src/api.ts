import axios, { type AxiosResponse } from 'axios';

type Contact = {
  name: string;
  email: string;
  phone: string;
};

type UploadResponse = {
  message: string;
};

const api = axios.create({
  baseURL: 'https://8j5baasof2.execute-api.us-west-2.amazonaws.com/production/tests/trucode',
});

export const uploadData = async (data: Contact): Promise<UploadResponse> => {

    const response: AxiosResponse<UploadResponse> = await api.post('/items', data);
    return response.data;

};

export const downloadData = async (): Promise<Contact[]> => {

    const response: AxiosResponse<Contact[]> = await api.get('/items');
    return response.data;

};
