jQuery(function($) {
    $(document).on('wc-composite-component-loaded', function(e, composite, component) {
    setTimeout(function () {
        $('.component_options_select').each(function () {
            var $select = $(this);

            if ($select.hasClass('select2-hidden-accessible')) {
                $select.select2('destroy');
            }

            $select.select2({
                width: '100%',
                //minimumResultsForSearch: Infinity,
                templateResult: formatOption,
                templateSelection: formatSelection,
                escapeMarkup: function (markup) {
                    return markup;
                }
            });
        });
    }, 150);
});

    
    function formatOption(option) {
        if (!option.id) return option.text;
        
        var $option = $(option.element);
        var title = $option.data('title');
        var price = $option.data('price') || '';
        var regularPrice = $option.data('regular-price');
        
        var $container = $('<div class="select2-option-container"></div>');
        
       // Main row with title and price
        var $mainRow = $('<div class="select2-option-main-row"></div>');
        $mainRow.append('<span class="select2-option-title">' + title + '</span>');

        var $priceWrapper = $('<div class="select2-option-prices"></div>');
        if (regularPrice) {
            $priceWrapper.append('<span class="select2-option-price-reg"><span class="woocommerce-Price-amount amount"><span class="woocommerce-Price-currencySymbol">£</span>' + regularPrice + '</span></span>');
        }
        if (price) {
            $priceWrapper.append('<span class="select2-option-price">' + price + '</span>');
        }
// if (typeof myProductData !== 'undefined' && myProductData.description) {
//         $mainRow.append('<div class="select2-option-description">' + myProductData.description + '</div>');
//     }

        $mainRow.append($priceWrapper);

        
        
        $container.append($mainRow);
        
        if ($option.is(':disabled')) {
            $container.addClass('select2-option-disabled');
        }
        
        return $container;
    }
    
    function formatSelection(option) {
        if (!option.id) return option.text;
        return $(option.element).data('title');
    }
});