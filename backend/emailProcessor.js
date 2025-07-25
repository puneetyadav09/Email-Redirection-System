const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const { Ollama } = require('ollama');
const { forwardEmail } = require('./forwarder');

const ollama = new Ollama();

async function processEmails({ email, password, fallbackEmail, departmentList }) {
  const config = {
    imap: {
      user: email,
      password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      connTimeout: 10000,
      authTimeout: 5000
    }
  };

  const connection = await imaps.connect(config);
  await connection.openBox('INBOX');

  const searchCriteria = ['UNSEEN'];
  const fetchOptions = {
    bodies: [''],
    struct: true,
    markSeen: true,
    };

  const messages = await connection.search(searchCriteria, fetchOptions);
  const forwarded = [];

  for (let i = 0; i < messages.length; i++) {
    const parts = messages[i].parts.filter(part => part.which === '');
    const raw = parts[0].body;

    try {
      const parsed = await simpleParser(raw);

      const subject = parsed.subject || 'No Subject';
      const body = parsed.text || parsed.html || 'No content';

      const prompt = `Categorize the following email into one of these departments: ${Object.keys(departmentList).join(', ')}.\n\nSubject: ${subject}\n\n${body}\n\nReply only with the department name.`;

      const response = await ollama.chat({
        model: 'llama3',
        messages: [{ role: 'user', content: prompt }],
      });

      const department = response.message.content.trim().toLowerCase();
      const toEmail = departmentList[department] || fallbackEmail;
      const status = departmentList[department] ? department : 'Fallback';

      await forwardEmail({
        fromEmail: email,
        password,
        toEmail,
        subject,
        body,
        attachments: parsed.attachments || []
      });

      forwarded.push({ subject, to: toEmail, department: status });
    } catch (emailProcessingError) {
      console.error("Error processing a single email:", emailProcessingError);
    }
  }

  try {
    await connection.closeBox();
    connection.end();
  } catch (connectionError) {
    console.error("Error closing IMAP connection:", connectionError);
  } finally {
      return {
        message: 'All emails processed and forwarded',
        forwarded,
      };
  }
}

module.exports = { processEmails };
