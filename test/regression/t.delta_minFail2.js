function OrderedCollection() {
    this.elms = new Array();
}
OrderedCollection.prototype.add = function(elm) {
   this.elms.push(elm);
};

function Strength() { ; }
Strength.strongest = function(s1) 
/*c js:StrengthClass.(js:s) -> top ~noAsserts */ {
    return s1;
};
Strength.REQUIRED = new Strength();


function BinaryConstraint(var1) {
    this.v1 = var1;
    this.v1.addConstraint(this);
}
BinaryConstraint.prototype.isInput = function() 
   /*c js:c.() -> bool  */ {
	return false;
};


function Variable() {
	this.constraints = new OrderedCollection();
}
Variable.prototype.addConstraint = function(c) {
	this.constraints.add(c);
};