import CryptoJS from 'crypto-js';
const env = require('../.env.local');
import jsCookies from 'js-cookie';

const ENCRYPTION_KEY = "2oBafStSUXdEtSjhsSTmKaUdpksDBOVd"; // env.COOKIES_ENCRYPTION_KEY;

// Check if ENCRYPTION_KEY is defined and not empty
const isEncryptionKeyValid = ENCRYPTION_KEY && ENCRYPTION_KEY.trim() !== '';

// Encrypt the data using AES encryption
export const encryptData = (data) => {
    if (!isEncryptionKeyValid) {
        throw new Error('Invalid ENCRYPTION_KEY');
    }

    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

// Decrypt the data using AES decryption
export const decryptData = (encryptedData) => {
    if (!isEncryptionKeyValid) {
        throw new Error('Invalid ENCRYPTION_KEY');
    }

    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    
        return decryptedData;
    } catch (err) {
        jsCookies.set('token', '');

        return null;
    }
};
