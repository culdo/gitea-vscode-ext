import { Uri, Webview } from 'vscode';
import { Issue } from './issue';
import { getNonce } from './utils/getNonce';
import { getUri } from './utils/getUri';
import { readFileSync } from 'fs';
import path = require('path');
import MarkdownIt = require('markdown-it');
const md = new MarkdownIt()

export function showIssueHTML(issue: Issue, webview: Webview, extensionUri: Uri) {
    const nonce = getNonce();
    const styleUri = getUri(webview, extensionUri, ["resources", "styles.css"]);

    const template = readFileSync(
        path.join(
            extensionUri.fsPath, "resources", "issue-template.html"
        ),
        { encoding: "utf-8" }
    )
    return template
        .replace(/{{styleUri}}/g, styleUri)
        .replace(/{{creator}}/g, issue.user.login)
        .replace(/{{state}}/g, issue.state)
        .replace(/{{created_at}}/g, new Date(issue.created_at).toLocaleDateString())
        .replace(/{{assignee}}/g, issue.assignee.login)
        .replace(/{{description}}/g, md.render(issue.body))
        .replace(/{{label}}/g, issue.title);
}
