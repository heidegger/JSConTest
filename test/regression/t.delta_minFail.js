function Constraint() {
   //  inc(this);
   this.add();
}

Constraint.prototype.add = function() 
{
	inc(this);
};

var inc = function (c) 
     /*c f: js:c -> undefined */
{
	c.a; 
};

