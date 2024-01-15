import { Uri, TreeItem, TreeItemCollapsibleState, Command, ThemeIcon, ThemeColor } from 'vscode';

interface Label {
  color: string;
  id: number;
  name: string;
  url: string;
}

export class Issue extends TreeItem {
    contextValue = 'issue';
    original_issue? : Issue;

  static createIssue(element: Issue) {
    let ret = new Issue(
        element.label,
        element.issueId,
        element.body,
        element.state,
        element.assignee,
        element.assignees,
        element.creator,
        element.labels,
        element.collapsibleState,
        element.title,
        element.html_url)
    ret.original_issue = element;
    return ret
  }

  constructor(
    public readonly label: string,
    public issueId: number,
    public body: string,
    public state: string,
    public assignee: string,
    public assignees: any[],
    public creator: string,
    public labels: Label[],
    public collapsibleState: TreeItemCollapsibleState,
    public title: string,
    public html_url: string,
    public command?: Command
  ) {
    super(label, collapsibleState);
    this.tooltip = this.label + ' - ' + this.assignee;
    if(this.state == "open") {
      this.iconPath = new ThemeIcon("issues", new ThemeColor("giteaExt.open"))
    } else {
      this.iconPath = new ThemeIcon("issue-closed", new ThemeColor("giteaExt.closed"))
    }
  }
}
