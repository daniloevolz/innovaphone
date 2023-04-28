using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Parameters;
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

            //string ciphertext = EncryptRC4(objeto, token);
            string ciphertext = EncryptSHA256(objeto, token);
            //string ciphertext = EncryptAES(token, token, objeto);
            textBoxResult.Text = ciphertext; // Exibe o hash criptografado na tela

            string decrypt = DecryptRC4(ciphertext, token);
            textBox1.Text = decrypt;

        }
        public static string EncryptSHA256(string text, string key)
        {
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);
            byte[] messageBytes = Encoding.UTF8.GetBytes(text);

            using (HMACSHA256 hmac = new HMACSHA256(keyBytes))
            {
                return Convert.ToBase64String(hmac.ComputeHash(messageBytes));
            }
        }
        public static string EncryptRC4(string text, string key)
        {
            byte[] input = Encoding.UTF8.GetBytes(text);
            byte[] output = new byte[input.Length];
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);

            // Configurando o RC4 com a chave de 32 bits
            var rc4 = new RC4Engine();
            var keyParam = new KeyParameter(keyBytes);
            rc4.Init(true, keyParam);

            // Criptografando os dados de entrada
            rc4.ProcessBytes(input, 0, input.Length, output, 0);

            return Convert.ToBase64String(output);
        }
        public static string DecryptRC4(string text, string key)
        {
            byte[] input = Convert.FromBase64String(text);
            byte[] output = new byte[input.Length];
            byte[] keyBytes = Encoding.UTF8.GetBytes(key);

            // Configurando o RC4 com a chave de 32 bits
            var rc4 = new RC4Engine();
            var keyParam = new KeyParameter(keyBytes);
            rc4.Init(false, keyParam);

            // Descriptografando os dados de entrada
            rc4.ProcessBytes(input, 0, input.Length, output, 0);

            return Encoding.UTF8.GetString(output);
        }
        private void btnLimpar_Click(object sender, EventArgs e)
        {
            textBoxToken.Text = null;
            textBoxObj.Text = null;
            textBoxResult.Text = null; // Exibe o hash criptografado na tela
        }

        private void textBoxToken_TextChanged(object sender, EventArgs e)
        {

        }

        private void textBox1_TextChanged(object sender, EventArgs e)
        {

        }
    }
}
