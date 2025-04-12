/**
 * 滚动监听和菜单跟踪
 * 根据滚动位置自动高亮对应的侧边栏菜单项
 */
(function($) {
    // 存储所有分类标题的位置信息
    var sectionPositions = [];
    var isScrolling = false;
    var sidebarWidth = 280; // 默认侧边栏宽度
    
    // 初始化函数
    function init() {
        // 获取所有分类标题元素
        var sections = $('h4.text-gray');
        
        // 计算每个分类标题的位置
        updateSectionPositions();
        
        // 绑定滚动事件
        $('.main-content').on('scroll', function() {
            if (!isScrolling) {
                window.requestAnimationFrame(function() {
                    highlightMenuOnScroll();
                    updateScrollIndicator();
                    isScrolling = false;
                });
                isScrolling = true;
            }
        });
        
        // 窗口大小改变时重新计算位置
        $(window).on('resize', function() {
            updateSectionPositions();
            updateScrollIndicator();
            adjustSidebarAndContent();
        });
        
        // 侧边栏折叠状态变化时重新调整布局
        $(document).on('click', '[data-toggle="sidebar"]', function() {
            setTimeout(function() {
                adjustSidebarAndContent();
                updateSectionPositions();
            }, 300);
        });
        
        // 初始化滚动指示器
        updateScrollIndicator();
        
        // 初始布局调整
        adjustSidebarAndContent();
    }
    
    // 调整侧边栏和内容区布局
    function adjustSidebarAndContent() {
        sidebarWidth = $('.sidebar-menu').hasClass('collapsed') ? 80 : 280;
        $('.main-content').css({
            'margin-left': sidebarWidth + 'px',
            'width': 'calc(100% - ' + sidebarWidth + 'px)'
        });
    }
    
    // 更新所有分类标题的位置信息
    function updateSectionPositions() {
        sectionPositions = [];
        $('h4.text-gray').each(function() {
            var id = $(this).find('i').attr('id');
            if (id) {
                sectionPositions.push({
                    id: id,
                    top: $(this).offset().top - $('.main-content').offset().top + $('.main-content').scrollTop() - 80 // 调整偏移量
                });
            }
        });
        
        // 按位置排序
        sectionPositions.sort(function(a, b) {
            return a.top - b.top;
        });
    }
    
    // 根据滚动位置高亮对应的菜单项
    function highlightMenuOnScroll() {
        var scrollPosition = $('.main-content').scrollTop();
        
        // 找到当前滚动位置对应的分类
        var currentSection = null;
        for (var i = 0; i < sectionPositions.length; i++) {
            if (scrollPosition >= sectionPositions[i].top) {
                currentSection = sectionPositions[i].id;
            } else {
                break;
            }
        }
        
        // 如果找到当前分类，高亮对应的菜单项
        if (currentSection) {
            // 移除所有菜单项的激活状态
            $('#main-menu li').removeClass('active');
            
            // 找到对应的菜单项并添加激活状态
            var $menuItem = $('#main-menu a[href="#' + currentSection + '"]');
            
            // 如果菜单项在子菜单中，先展开父菜单
            var $parentLi = $menuItem.closest('ul').parent('li');
            if ($parentLi.length > 0) {
                $parentLi.addClass('expanded active');
                $menuItem.parent('li').addClass('active');
            } else {
                $menuItem.parent('li').addClass('active');
            }
            
            // 确保菜单项可见
            ensureMenuItemVisible($menuItem);
        }
    }
    
    // 确保菜单项可见
    function ensureMenuItemVisible($menuItem) {
        if ($menuItem.length === 0) return;
        
        var menuHeight = $('.sidebar-menu-inner').height();
        var itemTop = $menuItem.position().top;
        var itemHeight = $menuItem.outerHeight();
        var scrollTop = $('.sidebar-menu-inner').scrollTop();
        
        // 如果菜单项不在可见区域内，滚动到可见位置
        if (itemTop < 0 || itemTop + itemHeight > menuHeight) {
            $('.sidebar-menu-inner').animate({
                scrollTop: scrollTop + itemTop - menuHeight / 2 + itemHeight / 2
            }, 300);
        }
    }
    
    // 更新滚动指示器
    function updateScrollIndicator() {
        var scrollPosition = $('.main-content').scrollTop();
        
        // 更新指示器激活状态
        $('.scroll-indicator-dot').removeClass('active');
        
        // 找到当前滚动位置对应的分类
        var currentSection = null;
        for (var i = 0; i < sectionPositions.length; i++) {
            if (scrollPosition >= sectionPositions[i].top) {
                currentSection = sectionPositions[i].id;
            } else {
                break;
            }
        }
        
        if (currentSection) {
            $('.scroll-indicator-dot[data-target="#' + currentSection + '"]').addClass('active');
        }
    }
    
    // 页面加载完成后初始化
    $(document).ready(function() {
        init();
    });
    
})(jQuery); 