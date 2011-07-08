function OrderedCollection() {
    this.elems = new Array();
}
OrderedCollection.prototype.add = function(elm) {
   this.elems.push(elm);
};

function BinaryConstraint(v1) {
    this.v1 = v1;
    this.v1.addConstraint(this);
}

function Variable() {
    this.constraints = new OrderedCollection();
}
Variable.prototype.addConstraint = function(c) {
	this.constraints.add(c);
};

function Strength() { ; }
Strength.strongest = function(s1) 
/*c js:s -> top ~noAsserts */ {
    return s1;
};

BinaryConstraint.prototype.isInput = function() 
   /*c js:c.() -> top  */ {
       ;
};
