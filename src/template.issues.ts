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

    const issueTemplate = readFileSync(
        path.join(
            extensionUri.fsPath, "resources", "issue-template.html"
        ),
        { encoding: "utf-8" }
    )

    const commentTemplate = readFileSync(
        path.join(
            extensionUri.fsPath, "resources", "comment-template.html"
        ),
        { encoding: "utf-8" }
    )

    function createComment(author: string, created_at: string, content: string) {
        return commentTemplate
            .replace(/{{author}}/g, author)
            .replace(/{{created_at}}/g, new Date(created_at).toLocaleDateString())
            .replace(/{{content}}/g, md.render(content))
    }

    const comments = createComment(issue.user.login, issue.created_at, issue.body)

    return issueTemplate
        .replace(/{{label}}/g, issue.title)
        .replace(/{{cspSource}}/g, webview.cspSource)
        .replace(/{{nonce}}/g, nonce)
        .replace(/{{styleUri}}/g, styleUri)
        .replace(/{{creator}}/g, issue.user.login)
        .replace(/{{state}}/g, issue.state)
        .replace(/{{created_at}}/g, new Date(issue.created_at).toLocaleDateString())
        .replace(/{{assignee}}/g, issue.assignee.login)
        .replace(/{{comments}}/g, comments)
}
