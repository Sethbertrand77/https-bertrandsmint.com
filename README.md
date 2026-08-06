# https-bertrandsmint.com

A small workspace for the bertrandsmint.com project — a simple static site to showcase products and projects from Bertrand's Mint.

## About

This repository hosts the source and configuration for https://bertrandsmint.com. The site is intended to be a lightweight, static website that can be deployed via GitHub Pages or any static-site host.

## Features

- Static website suitable for GitHub Pages
- Custom domain support (bertrandsmint.com)
- Minimal dependencies — easy to build and deploy

## Getting started (local development)

Prerequisites:
- Git
- A modern web browser
- [Optional] Node.js + npm if you use a static site generator (e.g., Eleventy, Jekyll, Hugo)

Simple steps to preview locally (if the site is plain HTML):

1. Clone the repository

   git clone https://github.com/Sethbertrand77/https-bertrandsmint.com.git
   cd https-bertrandsmint.com

2. Open index.html in your browser:

   - Double-click the file, or
   - Serve locally with a simple server (Python):

     python3 -m http.server 8000

     then visit http://localhost:8000

If the site uses a static-site generator, follow that generator's dev instructions (e.g., npm install, npm run dev).

## Deployment

Recommended: GitHub Pages

1. Push the repository to GitHub.
2. In the repository Settings > Pages, choose the branch (usually main) and folder (root or /docs) to publish.
3. To use the custom domain (bertrandsmint.com), add a file named `CNAME` at the repository root containing the domain, and configure your DNS:
   - For apex domain (bertrandsmint.com): create A records pointing to GitHub Pages IPs.
   - For www subdomain: create a CNAME record to `your-github-username.github.io`.

GitHub Pages will provide HTTPS automatically once DNS is configured and propagated.

## Custom domain / HTTPS notes

- Add a `CNAME` file containing `bertrandsmint.com` to the repository root.
- Configure DNS records with your domain registrar. GitHub's Pages documentation has current IPs and instructions.
- After DNS propagation, enable GitHub Pages' HTTPS option in the repository settings.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request with a clear description of changes.

- Fork the repository
- Create a topic branch: `git checkout -b my-feature`
- Commit your changes and push
- Open a Pull Request describing your changes

## License

This repository is not yet licensed. If you would like to use a license, consider adding an open-source license such as MIT. Example MIT license text can be added in a `LICENSE` file.

## Contact

Owner: Seth (@Sethbertrand77)

If you'd like me to customize this README further (add a site structure, build steps for a specific generator, or a license file), tell me what you'd like to include and I will update it.