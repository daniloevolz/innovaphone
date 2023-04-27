using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.IO;
using Newtonsoft.Json;


namespace WecomLicenseCreator
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }
        private void btnCriptografar_Click(object sender, EventArgs e)
        {
            string token = textBoxToken.Text.Trim(); // Obtém o token do input e remove os espaços em branco
            string objeto = textBoxObj.Text.Trim(); // Obtém o valor de USER do input e remove os espaços em branco
            //string hash = CreateSHA256Hash(token); //Cria hash do token

            string ciphertext = Encrypt(objeto, token, token);
            //string ciphertext = EncryptAES(token, token, objeto);
            textBoxResult.Text = ciphertext; // Exibe o hash criptografado na tela
        }
        public static string Encrypt(string text, string key, string iv)
        {
            if (iv.Length > 16)
            {
                iv = iv.Substring(0, 16);
            }
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] ivBytes = Encoding.UTF8.GetBytes(iv);
            byte[] textBytes = Encoding.UTF8.GetBytes(text);

            using (AesCryptoServiceProvider aes = new AesCryptoServiceProvider())
            {
                aes.Key = keyBytes;
                aes.IV = null;
                aes.Mode = CipherMode.CBC;
                aes.Padding = PaddingMode.PKCS7;

                ICryptoTransform encryptor = aes.CreateEncryptor();

                byte[] encryptedBytes = encryptor.TransformFinalBlock(textBytes, 0, textBytes.Length);

                return Convert.ToBase64String(encryptedBytes);
            }
        }
        public static string EncryptAES(string key, string iv, string plaintext)
        {
            
            using (AesCryptoServiceProvider aes = new AesCryptoServiceProvider())
            {
                if (iv.Length > 16)
                {
                    iv = iv.Substring(0, 16);
                }
                byte[] ivBytes = Encoding.UTF8.GetBytes(iv);
                aes.Key = Encoding.UTF8.GetBytes(key);
                aes.IV = ivBytes;
                aes.Mode = CipherMode.CTS;

                ICryptoTransform encryptor = aes.CreateEncryptor(aes.Key, aes.IV);

                byte[] plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
                byte[] encryptedBytes = encryptor.TransformFinalBlock(plaintextBytes, 0, plaintextBytes.Length);

                return Convert.ToBase64String(encryptedBytes);
            }
        }
        private void btnLimpar_Click(object sender, EventArgs e)
        {
            textBoxToken.Text = null;
            textBoxObj.Text = null;
            textBoxResult.Text = null; // Exibe o hash criptografado na tela
        }
    }
}
