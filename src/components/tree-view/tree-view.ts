import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'tree-view',
    templateUrl: "tree-view.html"
})
export class TreeView {
    @Input() treeData: any[];
    @Output() selected = new EventEmitter();

    constructor() { }

    toggleChildren(node: any) {
        node.visible = !node.visible;
    }

}