<?php
/**
 * Dropdown Options template
 */
if (!defined('ABSPATH')) {
    exit;
}
?><script type="text/template" id="tmpl-wc_cp_options_dropdown">
    <# for (var index = 0; index <= data.length - 1; index++) { #>
        <# if (false === data[index].is_hidden) { #>
            <option value="{{ data[index].option_id }}" 
        data-title="{{ data[index].option_title }}"
        <# if (data[index].option_price_data && typeof data[index].option_price_data.price !== 'undefined') { #>
            data-regular-price="{{ data[index].option_price_data.price }}"
        <# } #>
        data-price="{{ data[index].option_price_html }}"
        <# if (data[index].is_disabled) { #>disabled="disabled"<# } #>
        <# if (data[index].is_selected) { #>selected="selected"<# } #>>
    {{{ data[index].option_title }}}
</option>

        <# } #>
    <# } #>
</script>