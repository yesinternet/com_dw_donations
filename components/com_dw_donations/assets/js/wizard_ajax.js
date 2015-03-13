function fn_ajax_controller_calls(func,format,request)
{
	return jQuery.ajax({
		url	: 'index.php?option=com_dw_donations&task=dwdonationform.'+func+'&format='+format,
		type   : 'POST',
		data   : request,
		success: function (response) {
			//console.log(response);
			try{
				response=jQuery.parseJSON(response);
				//console.log(response);
				var n_options={status:"danger",timeout:2000,pos:"top-center"};
				if(response.success){
					if(response.data.ngo_info.html){
						jQuery('.ngo_info').html(response.data.ngo_info.html);
						jQuery('.donate-btn-beneficiary').text(response.data.ngo_info.ngo_data.ngo_name);				
					}
				}else{
					jQuery.UIkit.notify(response.message,n_options);
				}
			}catch(e){
				//console.log(e);
				document.open();
				document.write(response);
				document.close();
			}
		},
		error: function(response) {
			console.log(response.responseText);
		}
	});
}

function fn_ngo_donate_button_click(ngo_id,custom_url)
{
	fn_url_change(custom_url);
	jQuery("#jform_beneficiary_id").val(ngo_id);
	var request = {
		'ngo_id' : ngo_id
	};
	fn_ajax_controller_calls('fn_get_beneficiary_info_ajax','ajax',request).done(function(){
		jQuery(".payment-step-1").slideToggle(1000);
		jQuery(".payment-step-2").slideToggle(1000);
	});
}

function fn_ajax_loader()
{
	jQuery(document).ajaxStart(function() {
        jQuery('.ngo-loader').show();
    });
	jQuery(document).ajaxStop(function() {
        jQuery('.ngo-loader').hide();
    });
}

function fn_url_change(data)
{
	if ( window.history.pushState ) {
		window.history.pushState({}, null, data);
	}else{	
		window.location = data;
	}
}

function fn_onpopstate()
{
	jQuery(window).on("popstate", function() {
    	window.location.reload();
  	});
}

function fn_payment_step_back()
{
	jQuery(".payment-step-back").click(function(){
		var step=jQuery(this).closest(".payment-step").attr('data-step');
		var prev=step-1;
		jQuery(".payment-step-"+step).slideToggle(1000);
		jQuery(".payment-step-"+prev).slideToggle(1000);
	});
}

function fn_update_donate_button(){
	jQuery('.donate-btn-amount').text(jQuery('.amnt input[type="radio"]:checked').val()+'€');
	
	jQuery('.amnt input[type="radio"]').click(function(){
		jQuery('.donate-btn-amount').text(jQuery('.amnt input[type="radio"]:checked').val()+'€');
	});
	jQuery(".amnt-button").click(function(){
		jQuery('.donate-btn-amount').text(jQuery('.amnt input[type="radio"]:checked').val()+'€');
	});
}

function fn_pagination_click(data,form)
{
	jQuery("#ngo_list_pagination li a").click(function(){
		jQuery("#ngo_page").val(jQuery(this).data('page'));
		fn_url_change(data+form.serialize());
		//console.log(data+form.serialize()+"test"+jQuery(this).data('page'));
	});
}

function fn_moneydonationwizard_init(current_url,plus)
{
	var form = jQuery('#form-moneydonation-filters');
	var formData;
	var formMethod;
	//var current_url=window.location.href;
	//var plus='<?php echo (JFactory::getConfig()->get('sef')==1)?'?':'&' ?>';
	
	var values_ngoItemsInList=jQuery('#ngo_item_no_list').val();
	if(values_ngoItemsInList==0){ values_ngoItemsInList=100; }
	
	var options = {
		valueNames: [ 'ngoName', 'ngoObjectives', 'ngoObjective', 'ngoActionArea', 'ngoPriority' ],
		page:values_ngoItemsInList,
		plugins: [ ListPagination({'innerWindow':1,'outerWindow':2}) ]
	};
	
	var ngoList = new List('form-moneydonation-filters', options);

	var updateList=function(){
		var values_ngoObjective=jQuery('#ngo_objective_list').val();
		var values_ngoActionArea=jQuery('#ngo_actionarea_list').val();
		ngoList.filter(function(item) {
			return (item.values().ngoObjective.indexOf(values_ngoObjective,0)>-1 || values_ngoObjective==0) && (item.values().ngoActionArea==values_ngoActionArea || values_ngoActionArea==0)
		});
		
	}
	updateList();
	jQuery('.ngo_filter').change(function(){
		updateList();
		
		formData = form.serialize();
		//formMethod = form.attr('method');
		//fn_url_change(current_url+plus+formData);
		fn_url_change(current_url+plus+formData);
	});
	
	jQuery('#ngo_item_no_list').change(function(){
		var count=jQuery(this).val();
		if(count==0){ count=100; }
		ngoList.show(1,count);
	});
	
	fn_payment_step_back();
	
	fn_onpopstate();
	
	fn_update_donate_button();
	
	jQuery('#ngo_sort_filter').change(function(){
		var stype=jQuery(this).find('option:selected').data('stype');
		ngoList.sort(stype,{order:jQuery(this).val()});
	})
	
	// jQuery('.ngoName, .list-img, .ngo-button').click(function(){
		// var benef_id=jQuery(this).closest('.ngo-row').data('benef-id');
		 // formData = form.serialize();
		 // var custom_url=current_url+plus+'beneficiary_id='+benef_id;
		 // fn_ngo_donate_button_click(benef_id,custom_url);
	 // });
	
	jQuery('.ngo-row').click(function(){
		var benef_id=jQuery(this).data('benef-id');
		formData = form.serialize();
		var custom_url=current_url+plus+'beneficiary_id='+benef_id;
		fn_ngo_donate_button_click(benef_id,custom_url);
	});
	
	jQuery('.payment-step-back').click(function(){
		formData = form.serialize();
		fn_url_change(current_url+plus+formData);
	});
	
	fn_ajax_loader();
}