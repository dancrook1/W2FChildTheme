<?php
/**
 * Composite Product template
 *
 * Override this template by copying it to 'yourtheme/woocommerce/single-product/add-to-cart/composite.php'.
 *
 * On occasion, this template file may need to be updated and you (the theme developer) will need to copy the new files to your theme to maintain compatibility.
 * We try to do this as little as possible, but it does happen.
 * When this occurs the version of the template file will be bumped and the readme will list any important changes.
 *
 * @since    2.4.0
 * @version  3.12.6
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_before_add_to_cart_form' ); ?>

<form method="post" enctype="multipart/form-data" class="cart cart_group composite_form cp-no-js <?php echo esc_attr( $classes ); ?>">

<?php
/**
 * woocommerce_composite_before_components hook
 *
 * @hooked wc_cp_before_components - 10
 */
do_action( 'woocommerce_composite_before_components', $components, $product );

if ( $navigation_style === 'single' ) {
    // Get composite tabs configuration
    $composite_tabs = get_field( 'composite_tabs', 'option' );
    $tab_assignments = get_post_meta( $product->get_id(), '_composite_tab_assignments', true );

    if ( ! is_array( $tab_assignments ) ) {
        $tab_assignments = array();
    }

    $used_tab_keys = array_filter( array_values( $tab_assignments ) );
    $used_tab_keys = array_unique( $used_tab_keys );

    $has_unassigned = false;
    foreach ( $components as $component_id => $component ) {
        if ( empty( $tab_assignments[ $component_id ] ) ) {
            $has_unassigned = true;
            break;
        }
    }

    // Filter only the tabs actually used in this product
    $tabs_for_display = array();
    if ( is_array( $composite_tabs ) ) {
        foreach ( $composite_tabs as $tab ) {
            $tab_key = $tab['tab_key'] ?? sanitize_title( $tab['tab_name'] );
            if ( in_array( $tab_key, $used_tab_keys, true ) ) {
                $tabs_for_display[] = $tab;
            }
        }
    }

    // Add "Other" tab only if needed
    if ( $has_unassigned ) {
        $tabs_for_display[] = array( 'tab_name' => 'Other', 'tab_key' => 'tab_other' );
    }

    // Show tabs only if there's at least one assigned or unassigned
    if ( ! empty( $tabs_for_display ) ) {
        echo '<ul class="composite-summary-tabs-nav">';
        foreach ( $tabs_for_display as $tab ) {
            $tab_key = $tab['tab_key'] ?? sanitize_title( $tab['tab_name'] );
            echo '<li><a href="#" class="tab-link" data-tab="' . esc_attr( $tab_key ) . '">' . esc_html( $tab['tab_name'] ) . '</a></li>';
        }
        echo '</ul>';

        // Group components by tab
        $grouped_components = [];
        foreach ( $components as $component_id => $component ) {
            $tab_key = 'tab_other';
            if ( isset( $tab_assignments[ $component_id ] ) && $tab_assignments[ $component_id ] !== '' ) {
                $tab_key = $tab_assignments[ $component_id ];
            }
            if ( ! isset( $grouped_components[ $tab_key ] ) ) {
                $grouped_components[ $tab_key ] = [];
            }
            $grouped_components[ $tab_key ][ $component_id ] = $component;
        }

        // Render components per tab group
        foreach ( $tabs_for_display as $index => $tab ) {
            $tab_key = ( $has_unassigned && $index === count( $tabs_for_display ) - 1 )
                ? 'tab_other'
                : ( $tab['tab_key'] ?? sanitize_title( $tab['tab_name'] ) );

            $is_active = $index === 0 ? 'active' : '';
            echo '<div class="composite-tab-group ' . esc_attr( $is_active ) . '" data-tab="' . esc_attr( $tab_key ) . '">';

            if ( isset( $grouped_components[ $tab_key ] ) ) {
                $loop = 0;
                $steps = count( $components );

                foreach ( $grouped_components[ $tab_key ] as $component_id => $component ) {
                    $loop++;

                    $tmpl_args = array(
                        'product'           => $product,
                        'component_id'      => $component_id,
                        'component'         => $component,
                        'component_data'    => $component->get_data(),
                        'component_classes' => $component->get_classes(),
                        'step'              => $loop,
                        'steps'             => $steps,
                    );

                    wc_get_template( 'single-product/component-single-page.php', $tmpl_args, '', WC_CP()->plugin_path() . '/templates/' );
                }
            }

            echo '</div>';
        }
        ?>
<div class="composite-tabs-bottom-nav">
    <button type="button" class="composite-tab-prev" disabled>← <span class="tab-prev-label"></span></button>
    <button type="button" class="composite-tab-next">→ <span class="tab-next-label"></span></button>
</div>
<?php
wp_enqueue_style(
        'composite-style',
        get_stylesheet_directory_uri() . '/assets/css/composite.css',
        [],
        filemtime( get_stylesheet_directory() . '/assets/css/composite.css' )
    );

    wp_enqueue_script(
        'composite-tabs-script',
        get_stylesheet_directory_uri() . '/assets/js/composite-tabs.js',
        [],
        filemtime( get_stylesheet_directory() . '/assets/js/composite-tabs.js' ),
        true
    );
?>

        <?php
    } else {
        // Fallback: render components normally if no tabs are configured
        $loop = 0;
        $steps = count( $components );
        
        foreach ( $components as $component_id => $component ) {
            ++$loop;
            $tmpl_args = array(
                'product'           => $product,
                'component_id'      => $component_id,
                'component'         => $component,
                'component_data'    => $component->get_data(),
                'component_classes' => $component->get_classes(),
                'step'              => $loop,
                'steps'             => $steps,
            );
            
            wc_get_template( 'single-product/component-single-page.php', $tmpl_args, '', WC_CP()->plugin_path() . '/templates/' );
        }
    }
} else {
    // Handle progressive and multi-page navigation styles
    $loop = 0;
    $steps = count( $components );
    
    foreach ( $components as $component_id => $component ) {
        ++$loop;
        $tmpl_args = array(
            'product'           => $product,
            'component_id'      => $component_id,
            'component'         => $component,
            'component_data'    => $component->get_data(),
            'component_classes' => $component->get_classes(),
            'step'              => $loop,
            'steps'             => $steps,
        );
        
        if ( $navigation_style === 'progressive' ) {
            wc_get_template( 'single-product/component-single-page-progressive.php', $tmpl_args, '', WC_CP()->plugin_path() . '/templates/' );
        } else {
            wc_get_template( 'single-product/component-multi-page.php', $tmpl_args, '', WC_CP()->plugin_path() . '/templates/' );
        }
    }
}

/**
 * woocommerce_composite_after_components hook
 *
 * @hooked wc_cp_after_components - 10
 * @hooked wc_cp_no_js_msg        - 15
 */
do_action( 'woocommerce_composite_after_components', $components, $product );
?>

</form>

<?php do_action( 'woocommerce_after_add_to_cart_form' ); ?>