//Original Author: Paul Hunt - April 2014

//Create our Namespace object to avoid polluting the global namespace
var pfh = pfh || {};

//Define our Header Render pattern
pfh.renderHeader = function(ctx) {
	//Define any header content here.
	//You can include JavaScript and CSS links here.
	var headerHTML = "<div>Header</div>";
	return headerHTML;
	}

//Define our footer render pattern
pfh.renderFooter = function(ctx) {
	//Define any footer content here.
	var footerHTML = "<div>Footer</div>";
	
	//Now begin the paging control
	var firstRow = ctx.ListData.FirstRow;
	var lastRow = ctx.ListData.LastRow;
	var prevPage = ctx.ListData.PrevHref;
	var nextPage = ctx.ListData.NextHref;	
	
	var pagingCtrl = "<div class='paging'>";
	// Using the JavaScript in line IF notation, we'll check IF the variable contains any data
	// If it does, then the relevant paging control for forwards or backwards will be displayed.
	
	pagingCtrl += prevPage ? "<a class='ms-commandLink ms-promlink-button ms-promlink-button-enabled' href='" +
		prevPage + "'><span class='ms-promlink-button-image'><img class='ms-promlink-button-left'" +
		 " src='/_layouts/15/images/spcommon.png?rev=23' /></span></a>" : "";

	pagingCtrl += prevPage || nextPage ? "<span class='ms-paging'><span class='First'>" + firstRow +
		"</span> - <span class='Last'>" + lastRow + "</span></span>" : "";
		
	pagingCtrl += nextPage ? "<a class='ms-commandLink ms-promlink-button ms-promlink-button-enabled' href='" +
		nextPage + "'><span class='ms-promlink-button-image'><img class='ms-promlink-button-right'" +
		" src='/_layouts/15/images/spcommon.png?rev=23'/></span></a>" : "";
	
	//If you want the paging to appear above the footer content, switch the order of these two items
	return footerHTML + pagingCtrl;
	}

//Define our item Render pattern
//This will be called once for each item being rendered from the list.
//All fields in the view can be access using ctx.CurrentItem.InternalFieldName
//NB: The field must be included in the view for it to be available
pfh.CustomItem = function(ctx) {
    var itemHTML = "<div>" + ctx.CurrentItem.Title + "</div>";
	return itemHTML;	
}

//Define any code/function that needs to be run AFTER the page has been completed and the DOM is complete.
pfh.PostRenderCallback = function(ctx) {
}

//Define the function that will register our Override with SharePoint.
pfh.RegisterTemplateOverride = function () {
// 	Define a JavaScript object that will contain our Override
	var overrideCtx = {};
	overrideCtx.Templates = {};
	
//	Here we assign our Header and Footer functions to the template overrides.
	overrideCtx.Templates.Header = pfh.renderHeader;
	overrideCtx.Templates.Footer = pfh.renderFooter;

// 	And here we assign the CustomItem function to the Item registration.
	overrideCtx.Templates.Item = pfh.CustomItem;
	
//	And finally we add our PostRender function.
//  This expects a JavaScript array, so we pass the function in []
	overrideCtx.onPostRender = [pfh.PostRenderCallback(ctx)];
	
//	Register this Display Template against views with matching BaseViewID and ListTemplateType
//	See http://msdn.microsoft.com/en-us/library/microsoft.sharepoint.client.listtemplatetype(v=office.15).aspx for more ListTemplateTypes	
	overrideCtx.BaseViewID = 99; //Note: We're using BaseView ID 99 to match our override below
	overrideCtx.ListTemplateType = 100;
	
//  Register the template overrides with SharePoint
	SPClientTemplates.TemplateManager.RegisterTemplateOverrides(overrideCtx);
};

//Now we load in our override to ensure that this Override is only applied to the intended ListView
ExecuteOrDelayUntilScriptLoaded(function(){

	var OldRenderListView = RenderListView;
	var OldRenderListView = RenderListView;
	RenderListView = function(ctx,webPartID){
		ctx.BaseViewId = 101 - parseInt(ctx.wpq.substring(3), 10); //WPQ2 produces 99, WPQ3 produced 98, etc
		OldRenderListView(ctx,webPartID);	
	};

	
},'ClientTemplates.js');


//Register for MDS enabled site otherwise the display template doesn't work on refresh
//Note: The ~sitecollection tokens cannot be used here!
RegisterModuleInit("/_catalogs/masterpage/Display Templates/csr_ovr_RenderListTemplate_Fixed.js", pfh.RegisterTemplateOverride); // CSR-override for MDS enabled site
pfh.RegisterTemplateOverride(); //CSR-override for MDS disabled site (because we need to call the entry point function in this case whereas it is not needed for anonymous functions)
