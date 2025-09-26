<?php
/**
 * Theme setup and style enqueueing
 */

// Enqueue parent and child theme styles
add_action( 'wp_enqueue_scripts', 'hello_elementor_child_enqueue_styles' );
function hello_elementor_child_enqueue_styles() {
    // Enqueue parent theme style
    wp_enqueue_style( 'hello-elementor-parent-style', get_template_directory_uri() . '/style.css' );

    // Enqueue child theme style
    wp_enqueue_style( 'hello-elementor-child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( 'hello-elementor-parent-style' ),
        filemtime( get_stylesheet_directory() . '/style.css' )
    );
}

/**
 * Custom Tabs System for WooCommerce Composite Products
 * Uses existing ACF options page with 'composite_tabs' repeater field
 */

// 1. Add Meta Box to Product Edit Page for Tab Assignment
add_action('add_meta_boxes', 'add_composite_tabs_meta_box');
function add_composite_tabs_meta_box() {
    add_meta_box(
        'composite_tabs_assignment',
        'Component Tab Assignment',
        'composite_tabs_meta_box_callback',
        'product',
        'normal',
        'high'
    );
}

function composite_tabs_meta_box_callback($post) {
    $product = wc_get_product($post->ID);
    if (!$product || $product->get_type() !== 'composite') {
        echo '<p>This feature is only available for Composite Products.</p>';
        return;
    }

    wp_nonce_field('composite_tabs_nonce', 'composite_tabs_nonce_field');
    
    $global_tabs = get_field('composite_tabs', 'option');
    if (!$global_tabs) {
        echo '<p>Please configure tabs in your theme options first.</p>';
        return;
    }

    $composite_data = $product->get_composite_data();
    if (empty($composite_data)) {
        echo '<p>No components found in this composite product.</p>';
        return;
    }

    $tab_assignments = get_post_meta($post->ID, '_composite_tab_assignments', true);
    if (!is_array($tab_assignments)) {
        $tab_assignments = array();
    }

    echo '<style>
        .composite-tabs-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .composite-tabs-table th, .composite-tabs-table td { padding: 10px; border: 1px solid #ddd; text-align: left; }
        .composite-tabs-table th { background-color: #f5f5f5; font-weight: bold; }
        .composite-tabs-table select { width: 100%; }
    </style>';

    echo '<table class="composite-tabs-table">';
    echo '<thead><tr><th>Component</th><th>Assign to Tab</th></tr></thead>';
    echo '<tbody>';
    
    foreach ($composite_data as $component_id => $component_data) {
        $component_title = $component_data['title'];
        $component_description = isset($component_data['description']) ? $component_data['description'] : '';
        $selected_tab = isset($tab_assignments[$component_id]) ? $tab_assignments[$component_id] : '';
        
        echo '<tr>';
        echo '<td><strong>' . esc_html($component_title) . '</strong></td>';
        //echo '<td>' . esc_html(wp_trim_words($component_description, 10)) . '</td>';
        echo '<td>';
        echo '<select name="composite_tab_assignments[' . esc_attr($component_id) . ']">';
        echo '<option value="">Select Tab</option>';
        
        foreach ($global_tabs as $index => $tab) {
            $tab_key = $tab['tab_key'] ?? sanitize_title($tab['tab_name']);
            $selected = ($selected_tab === $tab_key) ? 'selected' : '';
            echo '<option value="' . esc_attr($tab_key) . '" ' . $selected . '>' . esc_html($tab['tab_name']) . '</option>';
        }
        
        echo '</select>';
        echo '</td>';
        echo '</tr>';
    }
    
    echo '</tbody></table>';
    echo '<p><em>Note: Components not assigned to any tab will appear in the "Other" tab.</em></p>';
}

// 2. Save Meta Box Data
add_action('save_post', 'save_composite_tabs_assignment');
function save_composite_tabs_assignment($post_id) {
    if (!isset($_POST['composite_tabs_nonce_field']) || 
        !wp_verify_nonce($_POST['composite_tabs_nonce_field'], 'composite_tabs_nonce')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    if (isset($_POST['composite_tab_assignments']) && is_array($_POST['composite_tab_assignments'])) {
        update_post_meta($post_id, '_composite_tab_assignments', array_map('sanitize_text_field', $_POST['composite_tab_assignments']));
    }
}

// 3. Remove default composite add to cart form if we have tab assignments, to avoid duplication
add_action('wp', 'maybe_remove_default_composite_display');
function maybe_remove_default_composite_display() {
    if (is_admin()) return;

    if (is_product()) {
        global $product;
        if ($product && is_composite_product($product)) {
            $tab_assignments = get_post_meta($product->get_id(), '_composite_tab_assignments', true);
            $global_tabs = get_field('composite_tabs', 'option');

            if ($global_tabs && $tab_assignments && !empty(array_filter($tab_assignments))) {
                // Remove the default composite add-to-cart display (adjust hook and priority as needed)
                remove_action('woocommerce_composite_before_components_single', array('WC_CP_Single_Product_Display', 'components'), 10);
            }
        }
    }
}

// 4. Enqueue composite product scripts and styles if composite product
add_action('wp_enqueue_scripts', 'enqueue_composite_scripts');
function enqueue_composite_scripts() {
    if (is_product()) {
        global $product;
        if ($product && is_composite_product($product)) {
            wp_enqueue_script('wc-composite-single-product');
            wp_enqueue_style('wc-composite-single-product');
        }
    }
}



// Enqueue Select2 for composite products - works with off-canvas elements
function enqueue_select2_for_composite_products() {
    // Check if WooCommerce is active
    if ( class_exists( 'WooCommerce' ) ) {
        // WooCommerce already includes Select2, so ensure it's loaded globally
        wp_enqueue_script( 'select2' );
        wp_enqueue_style( 'select2', WC()->plugin_url() . '/assets/css/select2.css' );

        // Enqueue custom composite select2 initialization script globally
        wp_enqueue_script(
            'composite-select2-init',
            get_stylesheet_directory_uri() . '/assets/js/composite-select2-init.js',
            array( 'jquery', 'select2' ),
            filemtime( get_stylesheet_directory() . '/assets/js/composite-select2-init.js' ),
            true
        );

        // Enqueue custom Select2 styles globally
        wp_enqueue_style(
            'composite-select2',
            get_stylesheet_directory_uri() . '/assets/css/composite-select2.css',
            array( 'select2' ),
            filemtime( get_stylesheet_directory() . '/assets/css/composite-select2.css' )
        );
    }
}
add_action( 'wp_enqueue_scripts', 'enqueue_select2_for_composite_products' );

// Enqueue accordion scripts and styles for composite components
add_action( 'wp_enqueue_scripts', 'enqueue_composite_accordion_scripts' );
function enqueue_composite_accordion_scripts() {
    // Only load on product pages
    if ( is_product() ) {
        global $post;
        $product = wc_get_product( $post->ID );

        // Check if it's a composite product
        if ( is_a( $product, 'WC_Product' ) && $product->is_type( 'composite' ) ) {
            // Enqueue accordion CSS
            wp_enqueue_style(
                'composite-accordion-css',
                get_stylesheet_directory_uri() . '/assets/css/accordion.css',
                array(),
                filemtime( get_stylesheet_directory() . '/assets/css/accordion.css' )
            );

            // Enqueue accordion JavaScript
            wp_enqueue_script(
                'composite-accordion-js',
                get_stylesheet_directory_uri() . '/assets/js/accordion.js',
                array( 'jquery' ),
                filemtime( get_stylesheet_directory() . '/assets/js/accordion.js' ),
                true
            );

        }
    }
} 

add_filter( 'woocommerce_component_options_per_page', 'wc_cp_dynamic_options_per_page', 10, 3 );
function wc_cp_dynamic_options_per_page( $results_count, $component_id, $composite ) {
	$component = $composite->get_component( $component_id );

	if ( $component ) {
		$options_count = count( $component->get_options() );

		if ( $options_count > 4 ) {
			return 10; // Show 12 options if there are more than 4
		}
	}

	return 4; // Default
}
add_filter( 'woocommerce_composite_component_loop_columns', 'wc_cp_dynamic_component_columns', 10, 5 );
function wc_cp_dynamic_component_columns( $cols, $component_id, $composite ) {
	$component = $composite->get_component( $component_id );

	if ( $component ) {
		$options_count = count( $component->get_options() );

		if ( $options_count > 4 ) {
			return 5; // 5 columns if more than 4 options (will show as 6 columns baed on previous setup in 'Snippets')
		}
	}

	return 2; // Default
}

