$(document).ready(function(){
	$('#slider1').bxSlider({
		auto: true,
		autoHover: true,
		pause: 5000,
		nextImage: 'images/rightArrow.png',
		prevImage: 'images/leftArrow.png',
		onBeforeSlide: function(currentSlideNumber, totalSlideQty, currentSlideHtmlObject){
  			if(currentSlideNumber != 3)
  			{
  				$('#Slide4Video').css('display', 'none');
  			}
		},
		onAfterSlide: function(currentSlideNumber, totalSlideQty, currentSlideHtmlObject){
  					if(currentSlideNumber == 3)
  					{
  						$('#Slide4Video').css('display', 'block');
  					}
				}
	});
	
	if(isMobile())
	{
		$('#Slide4Video').html('<OBJECT CLASSID="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" '+
						'CODEBASE="http://www.apple.com/qtactivex/qtplugin.cab" WIDTH="335" HEIGHT="250" >' + 
						'<PARAM NAME="src" VALUE="videos/jameDavid.mp4" >' + 
						'<PARAM NAME="autoplay" VALUE="true" >' + 
						'<EMBED SRC="videos/jameDavid.mp4" TYPE="image/x-macpaint" ' + 
						'PLUGINSPAGE="http://www.apple.com/quicktime/download" WIDTH="335" HEIGHT="250" AUTOPLAY="true"></EMBED>' + 
						'</OBJECT>');
		$('#Slide4Video').css({'right':'150px','top':'200px'});
	}
	else
	{
		$('#Slide4Video').html('<video width="335" height="293" controls="controls">' + 
							'<source src="videos/jameDavid.m4v">' + 
							'<source src="videos/jameDavid.mp4">' +
							'</video>');					
	}
});

var foodNum = 4;
function addInputs(obj)
{
	obj.removeAttribute('onkeyup');
	foodNum++;
	$('#FoodAndQuantities').append('<div> Food Type: <input type="text" name="foodType' + foodNum + ' " onkeyup="addInputs(this)"> Quantity: <input class="quantityInput" type="number" value="1" min="1" step="1" name="foodQuantity' + foodNum + ' "></div>');
}

function isMobile(){
	var index = navigator.appVersion.indexOf("Mobile");
	return (index > -1);
}
function submitID(obj){
	var obVal = $(obj).attr('value');
	if(obVal != "")
	{
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if(xhr.readyState == 3){
				//alert(xhr.responseText);
				//TODO
				var data = $.parseJSON(xhr.responseText);
				$('input[name*="foodType"]').attr('value', "");
				$('input[name*="foodQuantity"]').attr('value', '0');
				for(var i=0; i<data.length; i++)
				{					
					if($('input[name="foodType'+(i+1)+ '"]').length == 0)
					{
						$('input[name="foodType'+(i+1) + '"]').removeAttr('onkeyup');
						foodNum++;
						$('#FoodAndQuantities').append('<div> Food Type: <input type="text" name="foodType' + foodNum + '"> Quantity: <input class="quantityInput" type="number" value="1" min="1" step="1" name="foodQuantity' + foodNum + '"></div>');
					}
					$('input[name="foodType'+(i+1) + '"]').attr('value', data[i]["food_type"]);
					$('input[name="foodQuantity'+(i+1) + '"]').attr('value', data[i]["quantity_pledged"]);
					console.log(data[i]["food_type"]);
					console.log(i);
				}
			}
		};
	    xhr.open('GET', 'http://10.97.33.182:8084/lookupPledge?username='+obVal, true );
		xhr.send();
		
		//[{"food_type":"Banana","quantity_pledged":0,"quantity_donated":3},{"food_type":"Mom's Spaghetti","quantity_pledged":0,"quantity_donated":999}]
	}
}