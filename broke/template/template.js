/* 
 * Django template engine based on the porting made by xiaocong.hust and John.Sec.Huang
 * http://code.google.com/p/jtl-javascript-template/
 * MIT Licensed
 * 
 */

(function(_){
	var
		Class= require('dependencies/class').Class
		,utils= require('broke/core/utils')
		,Parser= require('broke/template/parser').Parser
		,Template
		,Token
		// constants
		,TOKEN_TEXT= 0
		,TOKEN_VAR= 1
		,TOKEN_BLOCK= 2
		,TOKEN_COMMENT= 3
		
		// template syntax constants
		,FILTER_SEPARATOR= '|'
		,FILTER_ARGUMENT_SEPARATOR= ':'
		,VARIABLE_ATTRIBUTE_SEPARATOR= '.'
		,BLOCK_TAG_START= '{%'
		,BLOCK_TAG_END= '%}'
		,VARIABLE_TAG_START= '{{'
		,VARIABLE_TAG_END= '}}'
		,COMMENT_BLOCK_TAG_START= '{#'
		,COMMENT_TAG_END= '#}'
		,SINGLE_BRACE_START= '{'
		,SINGLE_BRACE_END= '}'
		
		,tagList= {}
		//,filterList= {}
		,filterList= require('broke/template/defaultfilters')
		,register= {
			tag: function(tagName, fn) {
				tagList[tagName]= fn;
			},
			filter: function(filterName, fn) {
				filterList[filterName]= fn;
			}
		}
	;
	
	Template= Class.extend({
		meta: {
			className: 'Template'
			,parent: _
		}
		,klass: {
			listRender: function(context, nodelist) {
				var result= [];
				
				//nodelist.each(function(){
				utils.forEach(nodelist, function(){
					result.push(this.render(context));
				});
				
				return result.join('');	
			},
			getVar: function(context, varstr) {
				return utils.getattr(varstr, context);
			}
		}
		,prototype: {
			init: function(tpl){
				this._nodelist = this._compile(tpl);
			},
			_compile: function(tpl){
				var
					tokens
					,tagStr= this._formRegx()
					,tagRe= new RegExp(tagStr, 'g')
					,bits= []
					,originalBits= tpl.bsplit(tagRe)
				;
				
				//originalBits.each(function(){
				utils.forEach(originalBits, function(){
					if(this != "") {
						bits.push(this);
					}
				});
				
				// create token
				tokens= utils.map(bits, function(){
					var tagToken;
					
					if(this.startsWith(BLOCK_TAG_START)) {
						tagToken= this.slice(BLOCK_TAG_START.length, -BLOCK_TAG_END.length);
						return new Token(TOKEN_BLOCK, tagToken);
					}
					else if(this.startsWith(VARIABLE_TAG_START)) {
						return new Token(TOKEN_VAR, this.slice(VARIABLE_TAG_START.length, -VARIABLE_TAG_END.length));
					} else {
						return new Token(TOKEN_TEXT, this);
					}
				});
				
				return (new Parser(tokens)).parse();
			}
			,_formRegx: function(){
				var ret = '';
				
				ret += '(' + BLOCK_TAG_START.rescape() + '.*?' + BLOCK_TAG_END.rescape() + 
				'|' + VARIABLE_TAG_START.rescape() + '.*?' + VARIABLE_TAG_END.rescape() + '|$' + ')';
				
				return ret;
			},		
			render: function(context){
				var result= [];
				
				//this._nodelist.each(function(){
				utils.forEach(this._nodelist, function(){
					if(typeof(this) === 'object') {
						typeof(this.render) === 'function' ?
							(result.push(this.render(context)))
							:
							(result.push(this.toString()));
					} else {
						result.push(this.toString());
					}
				});
				
				return result.join('');
			}
		}
	});
	
	Token= Class.extend({
		meta: {
			className: 'Token',
			parent: _
		},
		prototype: {
			init: function(type, content){
				this.type= type;
				
				if(this.type !== TOKEN_TEXT) {
					// remove trailing and leading white spaces
					content= content.replace(/^\s+|\s+$/g, '');
				}
				
				this.content= content;
			},
			tsplit: function(){}
		}
	});
	
	utils.extend(_, {
		TOKEN_TEXT: TOKEN_TEXT
		,TOKEN_VAR: TOKEN_VAR
		,TOKEN_BLOCK: TOKEN_BLOCK
		,TOKEN_COMMENT: TOKEN_COMMENT
		,FILTER_SEPARATOR: FILTER_SEPARATOR
		,FILTER_ARGUMENT_SEPARATOR: FILTER_ARGUMENT_SEPARATOR
		,VARIABLE_ATTRIBUTE_SEPARATOR: VARIABLE_ATTRIBUTE_SEPARATOR
		,BLOCK_TAG_START: BLOCK_TAG_START
		,BLOCK_TAG_END: BLOCK_TAG_END
		,VARIABLE_TAG_START: VARIABLE_TAG_START
		,VARIABLE_TAG_END: VARIABLE_TAG_END
		,COMMENT_BLOCK_TAG_START: COMMENT_BLOCK_TAG_START
		,COMMENT_TAG_END: COMMENT_TAG_END
		,SINGLE_BRACE_START: SINGLE_BRACE_START
		,SINGLE_BRACE_END: SINGLE_BRACE_END
		,tagList: tagList
		,filterList: filterList
		,register: register
		,COMMENT_TAG_END: COMMENT_TAG_END
	});
})(exports);
