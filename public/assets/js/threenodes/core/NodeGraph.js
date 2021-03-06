var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
define(['jQuery', 'Underscore', 'Backbone', 'order!threenodes/core/Node', 'order!threenodes/nodes/Base', 'order!threenodes/nodes/Conditional', 'order!threenodes/nodes/Geometry', 'order!threenodes/nodes/Lights', 'order!threenodes/nodes/Materials', 'order!threenodes/nodes/Math', 'order!threenodes/nodes/PostProcessing', 'order!threenodes/nodes/Three', 'order!threenodes/nodes/Utils', 'order!threenodes/nodes/Spread', 'order!threenodes/nodes/Particle'], function($, _, Backbone) {
  return ThreeNodes.NodeGraph = (function() {
    function NodeGraph() {
      this.get_node = __bind(this.get_node, this);
      this.render = __bind(this.render, this);
      this.get_component_by_type = __bind(this.get_component_by_type, this);
      this.create_node = __bind(this.create_node, this);      this.nodes = [];
      this.nodes_by_nid = {};
      this.node_connections = [];
      this.types = false;
    }
    NodeGraph.prototype.create_node = function(component, type, x, y, inXML, inJSON) {
      var n;
      if (inXML == null) {
        inXML = false;
      }
      if (inJSON == null) {
        inJSON = false;
      }
      n = new ThreeNodes.nodes.types[component][type](x, y, inXML, inJSON);
      this.context.injector.applyContext(n);
      this.nodes.push(n);
      this.nodes_by_nid[n.nid] = n;
      return n;
    };
    NodeGraph.prototype.get_component_by_type = function(type) {
      var comp, typ;
      if (this.types === false) {
        this.types = {};
        for (comp in ThreeNodes.nodes.types) {
          for (typ in ThreeNodes.nodes.types[comp]) {
            this.types[typ.toString()] = comp;
          }
        }
      }
      return this.types[type];
    };
    NodeGraph.prototype.render = function() {
      var evaluateSubGraph, invalidNodes, nid, node, terminalNodes, _i, _len, _ref;
      invalidNodes = {};
      terminalNodes = {};
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        if (node.has_out_connection() === false || node.auto_evaluate || node.delays_output) {
          terminalNodes[node.nid] = node;
        }
        invalidNodes[node.nid] = node;
      }
      evaluateSubGraph = function(node) {
        var upnode, upstreamNodes, _j, _len2;
        upstreamNodes = node.getUpstreamNodes();
        for (_j = 0, _len2 = upstreamNodes.length; _j < _len2; _j++) {
          upnode = upstreamNodes[_j];
          if (invalidNodes[upnode.nid] && !upnode.delays_output) {
            evaluateSubGraph(upnode);
          }
        }
        if (node.dirty || node.auto_evaluate) {
          node.update();
          node.dirty = false;
          node.rack.setFieldInputUnchanged();
        }
        delete invalidNodes[node.nid];
        return true;
      };
      for (nid in terminalNodes) {
        if (invalidNodes[nid]) {
          evaluateSubGraph(terminalNodes[nid]);
        }
      }
      return true;
    };
    NodeGraph.prototype.addConnection = function(c) {
      return this.node_connections[this.node_connections.length] = c;
    };
    NodeGraph.prototype.removeConnection = function(c) {
      var ind;
      ind = this.node_connections.indexOf(c);
      if (ind !== -1) {
        return this.node_connections.splice(ind, 1);
      }
    };
    NodeGraph.prototype.get_node = function(nid) {
      return this.nodes_by_nid[nid];
    };
    NodeGraph.prototype.remove_all_nodes = function() {
      var node, _i, _len, _ref;
      $("#tab-attribute").html("");
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        node.remove();
      }
      return true;
    };
    NodeGraph.prototype.remove_all_connections = function() {
      while (this.node_connections.length > 0) {
        this.node_connections[0].remove();
      }
      return true;
    };
    return NodeGraph;
  })();
});