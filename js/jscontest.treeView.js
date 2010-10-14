(function (P) {

	var T = {};
	P.treeView = T;

	//function to initialize the tree:
	// object, div-id -> tree
	function init(value,id) {
	    
	    //instantiate the tree:
	    var tree= new YAHOO.widget.TreeView(id);
	    
	    //turn dynamic loading on for entire tree:
	    tree.setDynamicLoad(loadDataForNode);
	    
	    var node = createNode("", value, tree.getRoot());
	                      
	     //The tree is not created in the DOM until this method is called:
	    tree.render();
	    
	    return tree;
	
	    
	}
	function createNode(key, value, parent) {
	    var str = "";
	    if (key) {
	        str = key + ": ";
	    }
	    if (P.check.isObject(value) || P.check.isArray(value)) {
	    	str += Object.prototype.toString.apply(value);
	    	var node = new YAHOO.widget.TextNode(str, parent, false);
	    	node.data = value;
	    } else {
	    	str += "" + value;
	    	var node = new YAHOO.widget.TextNode(str, parent, false);
	    	node.isLeaf = true;
	    	node.data = value;
	    }
	}
	
	
	function loadDataForNode(node, onCompleteCallback){
	    if (P.check.isObject(node.data)) {
	        var obj = node.data;
	        for (key in obj) {
	        	createNode(key, obj[key], node );
	        }
	    } else if (P.check.isArray(node.data)) {
	        var arr = node.data;        
	        for (var i=0; i < arr.length; i++) {
	        	createNode(i, arr[i], node );
	        }
	    }
	    // Be sure to notify the TreeView component when the data load is complete
	    onCompleteCallback();
	}
	
	T.init = init;

})(JSConTest);
