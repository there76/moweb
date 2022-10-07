package com.hmsec.utils;

import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.binary.Hex;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;


public class AESUtils {


    private String ALGO = "AES/CBC/PKCS5Padding";
    private byte[] keyValue;
    private String initialVector = "00000000000000000000000000000000";

    private Key key;
    private Cipher decryptor;
    private Cipher encryptor;

    public AESUtils(String encKey) {
        keyValue = encKey.getBytes();
        init();
    }

    public void init() {
        try {
            key = generateKey();
            encryptor = Cipher.getInstance(ALGO);
            IvParameterSpec iv = new IvParameterSpec(Hex.decodeHex(initialVector.toCharArray()));
            decryptor = Cipher.getInstance(ALGO);
            encryptor.init(Cipher.ENCRYPT_MODE, key, iv);
            decryptor.init(Cipher.DECRYPT_MODE, key, iv);
        } catch (NoSuchAlgorithmException | NoSuchPaddingException | InvalidKeyException | DecoderException | InvalidAlgorithmParameterException e) {
            throw new RuntimeException("AESUtils init fail", e);
        }
    }



    public String encrypt(String Data) {
        try {
            byte[] encVal = encryptor.doFinal(Data.getBytes());
            return Base64.getEncoder().encodeToString(encVal);
        } catch (IllegalBlockSizeException | BadPaddingException e) {
            throw new RuntimeException("AESUtils encrypt fail", e);
        }
    }

    public String decrypt(String encryptedData) {
        try {
            byte[] decordedValue = Base64.getDecoder().decode(encryptedData);
            byte[] decValue = decryptor.doFinal(decordedValue);
            return new String(decValue);
        } catch (IllegalBlockSizeException | BadPaddingException e) {
            throw new RuntimeException("AESUtils decrypt fail", e);
        }
    }

    private Key generateKey() {

        if (key == null) {
            key = new SecretKeySpec(keyValue, "AES");
        }

        return key;
    }

}
