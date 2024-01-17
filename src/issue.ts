import { Issue as GiteaIssue } from 'gitea-js';
import { Uri, TreeItem, TreeItemCollapsibleState, Command, ThemeIcon, ThemeColor, TreeItemLabel } from 'vscode';

interface Label {
    color: string;
    id: number;
    name: string;
    url: string;
}

type NoUndefinedField<T> = { [P in keyof T]-?: NoUndefinedField<NonNullable<T[P]>> };
export type Issue = NoUndefinedField<GiteaIssue>

export class IssueItem extends TreeItem {
    contextValue = 'issue';
    original_issue?: IssueItem;

    constructor(
        public issue: Issue,
        public collapsibleState: TreeItemCollapsibleState,
    ) {
        super(`#${issue.number} - ${issue.title}`, collapsibleState);
        issue.title = this.label as string

        this.tooltip = this.label + ' - ' + issue.assignee;
        if (issue.state == "open") {
            this.iconPath = new ThemeIcon("issues", new ThemeColor("giteaExt.open"))
        } else {
            this.iconPath = new ThemeIcon("issue-closed", new ThemeColor("giteaExt.closed"))
        }

        this.command = {
            command: 'giteaExt.viewIssue',
            title: '',
            arguments: [issue],
        };
    }
}
