Object.prototype.inherits = function (shuper) 
{   //TODO: Add contract
     function Inheriter() { ;
     }
	Inheriter.prototype = shuper.prototype;
	this.prototype = new Inheriter();
	this.superConstructor = shuper;
};

function OrderedCollection() {
    this.elms = new Array();
}
OrderedCollection.prototype.add = function(elm) {
   this.elms.push(elm);
};

function Strength() { ; }
Strength.strongest = function(s1, s2) 
/*c js:StrengthClass.(js:s,js:s) -> js:s ~noAsserts */ {
	return s1; 
};
Strength.REQUIRED = new Strength();


function Constraint() { ; }
Constraint.prototype.addConstraint = function() {
    this.addToGraph();
};
Constraint.prototype.isInput = function() 
   /*c js:c.() -> bool  */ {
	return false;
};

function BinaryConstraint(var1) {
	this.v1 = var1;
	this.addConstraint();
}
BinaryConstraint.inherits(Constraint);
BinaryConstraint.prototype.addToGraph = function() {
	this.v1.addConstraint(this);
};


function Variable() {
	this.constraints = new OrderedCollection();
}
Variable.prototype.addConstraint = function(c) {
	this.constraints.add(c);
};