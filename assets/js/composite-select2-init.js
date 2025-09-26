jQuery(function($) {
    // Initialize Select2 for composite components
    function initializeSelect2() {
        $('.component_options_select').each(function () {
            var $select = $(this);

            // Skip if already initialized
            if ($select.hasClass('select2-hidden-accessible')) {
                return;
            }

            $select.select2({
                width: '100%',
                dropdownParent: $select.closest('.component_options_select_wrapper'),
                templateResult: formatOption,
                templateSelection: formatSelection,
                escapeMarkup: function (markup) {
                    return markup;
                }
            });
        });
    }

    // Initialize on document ready
    initializeSelect2();

    // Re-initialize when composite components are loaded
    $(document).on('wc-composite-component-loaded', function(e, composite, component) {
        setTimeout(function () {
            initializeSelect2();
        }, 150);
    });

    // Initialize when content is dynamically loaded (for off-canvas elements)
    $(document).on('DOMNodeInserted', function(e) {
        if ($(e.target).find('.component_options_select').length > 0) {
            setTimeout(function() {
                initializeSelect2();
            }, 100);
        }
    });

    // Modern browsers - using MutationObserver for better performance
    if (typeof MutationObserver !== 'undefined') {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    $(mutation.addedNodes).each(function() {
                        if ($(this).is('.component_options_select') || $(this).find('.component_options_select').length > 0) {
                            setTimeout(function() {
                                initializeSelect2();
                            }, 100);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    
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