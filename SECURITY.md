# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email security concerns to: [Create a private security advisory](https://github.com/Abelo9996/EasyVoiceClone/security/advisories/new)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Status Updates**: Every 7 days until resolved
- **Resolution**: Varies by severity (critical issues prioritized)

### Disclosure Policy

- We request 90 days to resolve issues before public disclosure
- We will credit security researchers (unless you prefer to remain anonymous)
- We will publish a security advisory after the issue is fixed

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**
   ```bash
   pip install --upgrade -r requirements.txt
   npm update  # for web app
   ```

2. **Secure Your Voice Samples**
   - Store voice samples securely
   - Don't share voice profiles publicly
   - Use strong file permissions

3. **Ethical Use**
   - Only clone voices with explicit consent
   - Never use for impersonation or fraud
   - Be transparent about AI-generated content

4. **Web Application Security**
   - Run locally (don't expose to internet without proper security)
   - Use strong passwords if adding authentication
   - Keep Node.js and Python updated

### For Contributors

1. **No Hardcoded Secrets**
   - Never commit API keys, passwords, or tokens
   - Use environment variables
   - Check `.gitignore` before committing

2. **Input Validation**
   - Validate all user inputs
   - Sanitize file uploads
   - Limit file sizes

3. **Dependency Security**
   - Regularly update dependencies
   - Review security advisories
   - Use `pip audit` and `npm audit`

4. **Code Review**
   - Review code for security issues
   - Test with malicious inputs
   - Follow secure coding practices

## Known Security Considerations

### Voice Cloning Technology

Voice cloning technology can be misused. Users must:
- Obtain explicit consent before cloning voices
- Use clear disclaimers for AI-generated content
- Comply with local laws and regulations
- Never use for fraud, impersonation, or illegal activities

### Data Privacy

- Voice samples are stored locally
- No data is sent to external servers (except model downloads)
- Users are responsible for securing their voice data
- Delete voice samples when no longer needed

### Web Application

The web application:
- Runs locally by default (localhost:3000 and localhost:5000)
- Should not be exposed to the internet without proper security measures
- Does not include built-in authentication (add if exposing publicly)
- Stores voice files and audio locally

### Recommendations for Production Use

If deploying publicly, implement:
- Authentication and authorization
- HTTPS/TLS encryption
- Rate limiting
- File upload restrictions
- Content Security Policy headers
- Regular security audits

## Third-Party Dependencies

This project uses:
- Coqui TTS (MPL 2.0 License)
- React and related packages
- Flask and Python packages

Review their security policies:
- [Coqui TTS](https://github.com/coqui-ai/TTS)
- [React Security](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [Flask Security](https://flask.palletsprojects.com/en/latest/security/)

## Security Updates

We monitor:
- GitHub security advisories
- CVE databases
- Dependency vulnerabilities (`pip audit`, `npm audit`)

Subscribe to repository releases to stay informed about security updates.

## Compliance

Users must comply with:
- Local laws regarding AI-generated content
- Privacy regulations (GDPR, CCPA, etc.)
- Intellectual property laws
- Terms of service of any voice samples used

## Questions?

For non-security questions, use:
- GitHub Issues (for bugs)
- GitHub Discussions (for questions)

---

**Remember: With great power comes great responsibility.** Use voice cloning technology ethically and legally.
