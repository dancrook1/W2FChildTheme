/**
 * Accordion functionality for Composite Components with options-style-thumbnails class
 */
(function($) {
    'use strict';

    // Wait for DOM to be ready
    $(document).ready(function() {
        initializeAccordions();

        // Reinitialize accordions after AJAX updates (for composite products)
        $(document.body).on('wc_composite_component_loaded wc_composite_component_refreshed', function() {
            initializeAccordions();
        });

        // Also try after a short delay in case elements load later
        setTimeout(function() {
            initializeInfoButtons();
            initializeSummaryAccordion();
        }, 1000);
    });

    /**
     * Initialize accordion functionality
     */
    function initializeAccordions() {
        // Target only composite components with options-style-thumbnails class
        const accordionComponents = $('.composite_component.options-style-thumbnails');

        if (accordionComponents.length === 0) {
            return; // No matching elements found
        }

        // Initialize info buttons for thumbnails
        initializeInfoButtons();

        // Initialize info buttons for dropdown-only components (after thumbnail buttons are done)
        setTimeout(function() {
            initializeDropdownInfoButtons();
        }, 1000);

        // Also initialize when Select2 is ready
        $(document).on('select2:open', function(e) {
            setTimeout(function() {
                initializeDropdownInfoButtons();
            }, 100);
        });

        accordionComponents.each(function() {
            const $component = $(this);

            // Skip if already initialized
            if ($component.data('accordion-initialized')) {
                return;
            }

            const $titleWrapper = $component.find('.component_title_wrapper');
            const $inner = $component.find('.component_inner');

            if ($titleWrapper.length === 0 || $inner.length === 0) {
                return; // Required elements not found
            }

            // Mark as initialized
            $component.data('accordion-initialized', true);

            // Set up initial state (collapsed by default)
            $inner.removeClass('accordion-open');
            $titleWrapper.removeClass('active');

            // Add ARIA attributes for accessibility
            const componentId = $component.attr('id') || 'component_' + Math.random().toString(36).substr(2, 9);
            const innerId = $inner.attr('id') || componentId + '_content';

            $component.attr('id', componentId);
            $inner.attr('id', innerId);
            $titleWrapper.attr({
                'role': 'button',
                'aria-expanded': 'false',
                'aria-controls': innerId,
                'tabindex': '0'
            });
            $inner.attr({
                'role': 'region',
                'aria-labelledby': componentId + '_title'
            });

            // Add ID to title for ARIA labelledby
            const $titleText = $titleWrapper.find('.component_title, .component_title_text').first();
            if ($titleText.length > 0) {
                $titleText.attr('id', componentId + '_title');
            }

            // Click handler for accordion toggle
            $titleWrapper.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleAccordion($component, $titleWrapper, $inner);
            });

            // Keyboard accessibility
            $titleWrapper.on('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleAccordion($component, $titleWrapper, $inner);
                }
            });

            // Optional: Auto-expand first accordion or active component
            if ($component.hasClass('active') || $component.is(':first-child')) {
                // Uncomment the next line if you want first accordion open by default
                // toggleAccordion($component, $titleWrapper, $inner);
            }
        });
    }

    /**
     * Toggle accordion state
     */
    function toggleAccordion($component, $titleWrapper, $inner) {
        const isOpen = $inner.hasClass('accordion-open');

        if (isOpen) {
            // Close accordion
            $inner.removeClass('accordion-open');
            $titleWrapper.removeClass('active');
            $component.removeClass('active');
            $titleWrapper.attr('aria-expanded', 'false');

            // Trigger custom event
            $component.trigger('accordion:closed');
        } else {
            // Close other accordions (optional - remove for multi-open behavior)
            $('.composite_component.options-style-thumbnails .component_inner.accordion-open').each(function() {
                const $otherInner = $(this);
                const $otherComponent = $otherInner.closest('.composite_component');
                const $otherTitleWrapper = $otherComponent.find('.component_title_wrapper');

                $otherInner.removeClass('accordion-open');
                $otherTitleWrapper.removeClass('active');
                $otherComponent.removeClass('active');
                $otherTitleWrapper.attr('aria-expanded', 'false');
            });

            // Open this accordion
            $inner.addClass('accordion-open');
            $titleWrapper.addClass('active');
            $component.addClass('active');
            $titleWrapper.attr('aria-expanded', 'true');

            // Scroll to accordion if needed (optional)
            scrollToAccordion($component);

            // Trigger custom event
            $component.trigger('accordion:opened');
        }
    }

    /**
     * Scroll to accordion smoothly (optional feature)
     */
    function scrollToAccordion($component) {
        const headerHeight = 100; // Adjust based on your site's header height
        const targetPosition = $component.offset().top - headerHeight;

        // Only scroll if the accordion is not fully visible
        const windowTop = $(window).scrollTop();
        const windowBottom = windowTop + $(window).height();
        const accordionTop = $component.offset().top;
        const accordionBottom = accordionTop + $component.outerHeight();

        if (accordionTop < windowTop || accordionBottom > windowBottom) {
            $('html, body').animate({
                scrollTop: targetPosition
            }, 400, 'swing');
        }
    }

    /**
     * Initialize info buttons for product thumbnails
     */
    function initializeInfoButtons() {
        // Target all thumbnail titles (broader selector since the test worked)
        $('h5.thumbnail_title').each(function() {
            const $title = $(this);

            // Skip if info button already added
            if ($title.find('.info-button').length > 0) {
                return;
            }

            // Find the corresponding product data
            const $thumbnail = $title.closest('.component_option_thumbnail');
            const optionId = $thumbnail.data('val');
            const $component = $title.closest('.composite_component');
            const $componentOptions = $component.find('.component_options');
            const componentData = $componentOptions.data('options_data');

            // Add info button with proper styling
            const $infoButton = $('<button class="info-button" type="button" aria-label="View product details"><i class="dashicons dashicons-info"></i></button>');
            $title.append($infoButton);

            // Ensure the icon always stays as info icon, even when selection changes
            const maintainInfoIcon = function() {
                const $icon = $infoButton.find('.dashicons');
                $icon.removeClass('dashicons-yes dashicons-yes-alt dashicons-saved').addClass('dashicons-info');
            };

            // Watch for changes and maintain info icon
            const observer = new MutationObserver(maintainInfoIcon);
            observer.observe($infoButton[0], {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ['class']
            });

            // Also maintain icon on composite component events
            $component.on('wc_composite_component_selection_changed wc_composite_component_refreshed', maintainInfoIcon);

            if (componentData && optionId) {
                // Find the specific option data
                let productData = null;
                for (let i = 0; i < componentData.length; i++) {
                    if (componentData[i].option_id == optionId) {
                        productData = componentData[i];
                        break;
                    }
                }

                if (productData && productData.option_product_data && productData.option_product_data.product_html) {
                    // Add click handler for modal
                    $infoButton.on('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        showProductModal(productData.option_title, productData.option_product_data.product_html);
                    });
                } else {
                    // Fallback: try to get data from the selected component summary
                    $infoButton.on('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        // Try to find product details in the component summary
                        const $componentSummary = $component.find('.component_summary .summary_content');
                        const $details = $componentSummary.find('.details.component_data');

                        if ($details.length > 0) {
                            showProductModal($title.text(), $details.get(0).outerHTML);
                        } else {
                            alert('Product details not available for: ' + $title.text());
                        }
                    });
                }
            } else {
                // Basic fallback
                $infoButton.on('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Product details not available for: ' + $title.text());
                });
            }
        });
    }

    /**
     * Show product details modal
     */
    function showProductModal(title, htmlContent) {
        // Remove existing modal
        $('.product-info-modal').remove();

        // Extract details from HTML content
        const $tempDiv = $('<div>').html(htmlContent);
        const $details = $tempDiv.find('.details.component_data');

        if ($details.length === 0) {
            return; // No details found
        }

        // Create modal
        const $modal = $(`
            <div class="product-info-modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 id="modal-title">${title}</h3>
                        <button class="modal-close" type="button" aria-label="Close modal">
                            <span class="dashicons dashicons-no-alt"></span>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${$details.html()}
                    </div>
                </div>
            </div>
        `);

        // Add to body
        $('body').append($modal);

        // Focus management for accessibility
        const $closeButton = $modal.find('.modal-close');
        $closeButton.focus();

        // Close handlers
        $modal.find('.modal-close, .modal-overlay').on('click', function() {
            closeProductModal();
        });

        // Keyboard handler
        $modal.on('keydown', function(e) {
            if (e.key === 'Escape') {
                closeProductModal();
            }
        });

        // Trap focus within modal
        $modal.on('keydown', function(e) {
            if (e.key === 'Tab') {
                const focusableElements = $modal.find('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                const firstElement = focusableElements.first();
                const lastElement = focusableElements.last();

                if (e.shiftKey && $(document.activeElement).is(firstElement)) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && $(document.activeElement).is(lastElement)) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        // Show modal with animation
        setTimeout(function() {
            $modal.addClass('show');
        }, 10);
    }

    /**
     * Close product details modal
     */
    function closeProductModal() {
        const $modal = $('.product-info-modal');
        if ($modal.length === 0) return;

        $modal.removeClass('show');
        setTimeout(function() {
            $modal.remove();
        }, 300);
    }

    /**
     * Initialize info buttons for dropdown options
     */
    function initializeDropdownInfoButtons() {
        console.log('Initializing dropdown info buttons...');

        // Target Select2 dropdowns in composite components that DON'T have thumbnails
        $('.composite_component .component_options_select').each(function() {
            const $select = $(this);
            const $component = $select.closest('.composite_component');
            const componentData = $component.find('.component_options').data('options_data');

            console.log('Checking component:', $component.attr('class'));
            console.log('Has thumbnails class:', $component.hasClass('options-style-thumbnails'));
            console.log('Has thumbnail elements:', $component.find('.component_option_thumbnails').length > 0);
            console.log('Has existing dropdown info buttons:', $component.find('.dropdown-info-helper').length);

            // Skip if this component has thumbnails (thumbnail info buttons already handle this)
            if ($component.hasClass('options-style-thumbnails')) {
                console.log('Component has thumbnails class, skipping dropdown info button');
                return;
            }

            // Also skip if component has thumbnail elements (extra safety check)
            if ($component.find('.component_option_thumbnails').length > 0) {
                console.log('Component has thumbnail elements, skipping dropdown info button');
                return;
            }

            // Skip if there are already dropdown info buttons
            if ($component.find('.dropdown-info-helper').length > 0) {
                console.log('Component already has dropdown info buttons, skipping');
                return;
            }

            console.log('Found dropdown-only component:', $select.attr('id'));

            // Skip if already initialized
            if ($select.data('dropdown-info-initialized')) {
                console.log('Already initialized, skipping');
                return;
            }

            // Mark as initialized
            $select.data('dropdown-info-initialized', true);

            // Add info button next to the component title
            addInfoButtonNextToDropdown($select, $component, componentData);
        });
    }

    /**
     * Add info button next to component title (better approach)
     */
    function addInfoButtonNextToDropdown($select, $component, componentData) {
        // Target the specific structure: .component_title_wrapper > .step_title_wrapper.component_title
        const $titleWrapper = $component.find('.component_title_wrapper .step_title_wrapper.component_title');

        if ($titleWrapper.length === 0) {
            console.log('Could not find title wrapper structure');
            return;
        }

        // Skip if button already exists ANYWHERE in the component
        if ($component.find('.dropdown-info-helper').length > 0) {
            console.log('Dropdown info helper already exists');
            return;
        }

        // Skip if there are already info buttons from thumbnails
        if ($component.find('.info-button').length > 0) {
            console.log('Thumbnail info buttons already exist');
            return;
        }

        console.log('Adding dropdown info button to title wrapper');

        // Create an info button next to the component title
        const $infoHelper = $('<div class="dropdown-info-helper"><button class="dropdown-main-info-button" type="button" aria-label="View current selection details"><i class="dashicons dashicons-info"></i></button></div>');
        $titleWrapper.append($infoHelper);

        // Handle click on the main info button
        $infoHelper.find('.dropdown-main-info-button').on('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get currently selected option
            const selectedValue = $select.val();
            const selectedText = $select.find('option:selected').text().trim();

            console.log('Selected value:', selectedValue);
            console.log('Selected text:', selectedText);

            if (componentData && selectedValue) {
                // Find the specific option data
                let productData = null;
                for (let i = 0; i < componentData.length; i++) {
                    if (componentData[i].option_id == selectedValue) {
                        productData = componentData[i];
                        break;
                    }
                }

                console.log('Product data found:', !!productData);

                if (productData && productData.option_product_data && productData.option_product_data.product_html) {
                    showProductModal(productData.option_title, productData.option_product_data.product_html);
                } else {
                    alert('Product details not available for: ' + selectedText);
                }
            } else {
                alert('Please select an option first');
            }
        });

        // Update button state when selection changes
        $select.on('change', function() {
            const hasSelection = $(this).val() !== '';
            $infoHelper.find('.dropdown-main-info-button').prop('disabled', !hasSelection);

            if (!hasSelection) {
                $infoHelper.find('.dropdown-main-info-button').attr('aria-label', 'Select an option to view details');
            } else {
                $infoHelper.find('.dropdown-main-info-button').attr('aria-label', 'View current selection details');
            }
        });

        // Set initial state
        const hasInitialSelection = $select.val() !== '';
        $infoHelper.find('.dropdown-main-info-button').prop('disabled', !hasInitialSelection);
    }

    /**
     * Create dropdown option with info button
     */
    function createOptionWithInfoButton(option, componentData) {
        if (!option.id) {
            return option.text;
        }

        // Create the option element with info button
        const $option = $(
            '<div class="select2-option-with-info">' +
                '<span class="option-text">' + option.text + '</span>' +
                '<button class="dropdown-info-button" type="button" data-option-id="' + option.id + '" data-option-title="' + option.text + '" aria-label="View product details">' +
                    '<i class="dashicons dashicons-info"></i>' +
                '</button>' +
            '</div>'
        );

        return $option;
    }

    /**
     * Initialize summary widget accordion functionality
     */
    function initializeSummaryAccordion() {
        $('.widget_composite_summary_elements').each(function() {
            const $widget = $(this);

            // Skip if already initialized
            if ($widget.data('summary-accordion-initialized')) {
                return;
            }

            // Mark as initialized
            $widget.data('summary-accordion-initialized', true);

            // Find the title element (could be h2, h3, or .widget-title)
            let $title = $widget.find('.widget-title').first();
            if ($title.length === 0) {
                $title = $widget.find('h2, h3').first();
            }

            // Find all summary elements (the content to toggle)
            const $summaryElements = $widget.find('.summary_element');

            if ($title.length === 0 || $summaryElements.length === 0) {
                return; // Required elements not found
            }

            // First, create wrapper for title if it doesn't exist
            if (!$title.parent().hasClass('summary_title_wrapper')) {
                $title.wrap('<div class="summary_title_wrapper"></div>');
            }

            const $titleWrapper = $widget.find('.summary_title_wrapper');

            // Now wrap all content EXCEPT the title wrapper
            if (!$widget.find('.summary_content').length) {
                // Get all direct children except the title wrapper
                const $allContent = $widget.children().not('.summary_title_wrapper');
                if ($allContent.length > 0) {
                    $allContent.wrapAll('<div class="summary_content"></div>');
                }
            }

            const $summaryContent = $widget.find('.summary_content');

            // Set up initial state (open by default)
            $summaryContent.addClass('accordion-open');
            $titleWrapper.addClass('active');

            // Add ARIA attributes for accessibility
            const widgetId = $widget.attr('id') || 'summary_widget_' + Math.random().toString(36).substr(2, 9);
            const contentId = widgetId + '_content';

            $widget.attr('id', widgetId);
            $summaryContent.attr('id', contentId);
            $titleWrapper.attr({
                'role': 'button',
                'aria-expanded': 'true',
                'aria-controls': contentId,
                'tabindex': '0'
            });
            $summaryContent.attr({
                'role': 'region',
                'aria-labelledby': widgetId + '_title'
            });
            $title.attr('id', widgetId + '_title');

            // Click handler for accordion toggle
            $titleWrapper.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleSummaryAccordion($titleWrapper, $summaryContent);
            });

            // Keyboard accessibility
            $titleWrapper.on('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSummaryAccordion($titleWrapper, $summaryContent);
                }
            });
        });
    }

    /**
     * Toggle summary accordion state
     */
    function toggleSummaryAccordion($titleWrapper, $summaryContent) {
        const isOpen = $summaryContent.hasClass('accordion-open');

        if (isOpen) {
            // Close accordion
            $summaryContent.removeClass('accordion-open');
            $titleWrapper.removeClass('active');
            $titleWrapper.attr('aria-expanded', 'false');
        } else {
            // Open accordion
            $summaryContent.addClass('accordion-open');
            $titleWrapper.addClass('active');
            $titleWrapper.attr('aria-expanded', 'true');
        }
    }

    /**
     * Public API for external control
     */
    window.CompositeAccordion = {
        open: function(componentId) {
            const $component = $('#' + componentId);
            if ($component.length > 0 && $component.hasClass('composite_component options-style-thumbnails')) {
                const $titleWrapper = $component.find('.component_title_wrapper');
                const $inner = $component.find('.component_inner');
                if (!$inner.hasClass('accordion-open')) {
                    toggleAccordion($component, $titleWrapper, $inner);
                }
            }
        },
        close: function(componentId) {
            const $component = $('#' + componentId);
            if ($component.length > 0 && $component.hasClass('composite_component options-style-thumbnails')) {
                const $titleWrapper = $component.find('.component_title_wrapper');
                const $inner = $component.find('.component_inner');
                if ($inner.hasClass('accordion-open')) {
                    toggleAccordion($component, $titleWrapper, $inner);
                }
            }
        },
        toggle: function(componentId) {
            const $component = $('#' + componentId);
            if ($component.length > 0 && $component.hasClass('composite_component options-style-thumbnails')) {
                const $titleWrapper = $component.find('.component_title_wrapper');
                const $inner = $component.find('.component_inner');
                toggleAccordion($component, $titleWrapper, $inner);
            }
        }
    };

})(jQuery);