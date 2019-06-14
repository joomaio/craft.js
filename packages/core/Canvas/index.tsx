import React from "react";
import { mapChildrenToNodes, createNode, nodesToArray } from "./helpers";
import { NodeId, CanvasNode, Nodes, NodeContextState } from "~types";
import NodeContext from "../Nodes/NodeContext";
import RenderDraggableNode from "../Nodes/RenderDraggableNode";
import RenderNode from "../Nodes/RenderNode";
import NodeElement from "../Nodes/NodeElement";
const shortid = require("shortid");

export default class Canvas extends React.PureComponent<any> {
  id: NodeId = null;
  nodes: Nodes = null;
  constructor(props: CanvasNode, context: NodeContextState) {
    super(props);
    const { node, pushChildCanvas, childCanvas, builder } = context;
    const { id } = props;

    let canvasId = this.id = `canvas-${shortid.generate()}`;
    if ( node.type === Canvas ) {
      canvasId = this.id = node.id;
    } else {
      if ( !id ) throw new Error("Root Canvas cannot ommit `id` prop");
      if ( childCanvas[id] ) canvasId = childCanvas[id];
    }
    
    if (!builder.nodes[canvasId] || (builder.nodes[canvasId] && !(builder.nodes[canvasId] as CanvasNode).nodes)) {
      const { children } = this.props;
      const childNodes = mapChildrenToNodes(children, canvasId);
      const rootNode: CanvasNode =  node.type === Canvas ? {...node} : createNode(this.constructor as React.ElementType, this.props, canvasId) ;

      if (node.type === Canvas) {
        rootNode.parent = node.parent;
      }
      rootNode.nodes = Object.keys(childNodes);

      builder.setNodes((prevNodes: Nodes) => {
        return {
          ...prevNodes,
          [rootNode.id]: rootNode,
          ...childNodes
        }
      });
    }

    if ( node.type !== Canvas ) {
      pushChildCanvas(id, canvasId);
    }

  }
  render() {
    const { incoming, outgoing, ...props } = this.props;

    return (
      <NodeContext.Consumer>
        {({ childCanvas, builder }) => {

          const canvasId = this.id ? this.id : childCanvas[this.props.id];
          if (!canvasId) return false;

          this.id = canvasId;
          const { nodes } = builder;
          const canvas = nodes[canvasId] as CanvasNode;

          return (
            canvas && <RenderNode
              {...props}
              node={canvas}
            >

              <React.Fragment>
                {
                  canvas && canvas.nodes && canvas.nodes.map((nodeId: NodeId) => {
                    return (
                      <NodeElement key={nodeId} node={nodes[nodeId]}>
                         <RenderDraggableNode />
                      </NodeElement>
                    )
                  })
                }
              </React.Fragment>
            </RenderNode>
          )
        }}
      </NodeContext.Consumer>
    )
  }
}

Canvas.contextType = NodeContext;
