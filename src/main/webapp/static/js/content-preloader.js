/**
 * 内容预加载功能
 * 在用户滚动时提前加载即将进入视图的内容
 */
(function($) {
    // 配置项
    var config = {
        threshold: 500,      // 预加载阈值（px），当元素距离视图底部小于此值时开始加载
        batchSize: 5,        // 每批加载的元素数量
        loadingClass: 'loading', // 正在加载的CSS类名
        loadedClass: 'loaded'    // 已加载的CSS类名
    };
    
    // 存储预加载的元素
    var $elements = [];
    var loadingBatch = false;
    
    // 初始化函数
    function init() {
        // 获取所有需要预加载的元素
        $elements = $('.xe-widget.xe-conversations');
        
        // 初始化时先加载可见区域的元素
        loadVisibleElements();
        
        // 绑定滚动事件到内容区域而不是窗口
        $('.main-content').on('scroll', function() {
            // 使用节流函数控制滚动事件的触发频率
            if (!loadingBatch) {
                requestAnimationFrame(loadVisibleElements);
            }
        });
        
        // 窗口大小变化时重新计算
        $(window).on('resize', function() {
            if (!loadingBatch) {
                requestAnimationFrame(loadVisibleElements);
            }
        });
    }
    
    // 加载可见区域的元素
    function loadVisibleElements() {
        if (loadingBatch) return;
        
        // 使用内容区域的滚动位置和高度
        var $content = $('.main-content');
        var scrollTop = $content.scrollTop();
        var contentHeight = $content.height();
        var viewportBottom = scrollTop + contentHeight;
        var elementsToLoad = [];
        
        // 找出需要加载的元素
        $elements.each(function() {
            var $element = $(this);
            
            // 已加载的元素跳过
            if ($element.hasClass(config.loadedClass)) {
                return;
            }
            
            // 计算元素相对于内容区域的位置
            var elementTop = $element.offset().top - $content.offset().top + scrollTop;
            
            // 当元素距离视图底部小于阈值时，标记为需要加载
            if (elementTop - viewportBottom < config.threshold) {
                elementsToLoad.push($element);
                
                // 达到批处理大小时停止
                if (elementsToLoad.length >= config.batchSize) {
                    return false;
                }
            }
        });
        
        // 加载标记的元素
        if (elementsToLoad.length > 0) {
            loadBatch(elementsToLoad);
        }
        
        loadingBatch = false;
    }
    
    // 批量加载元素
    function loadBatch(elementsToLoad) {
        loadingBatch = true;
        
        // 对每个元素执行加载
        $.each(elementsToLoad, function(index, $element) {
            // 添加加载中状态
            $element.addClass(config.loadingClass);
            
            // 加载图片
            var $img = $element.find('img');
            $img.each(function() {
                var $this = $(this);
                var originalSrc = $this.attr('data-original');
                
                if (originalSrc) {
                    // 创建一个新的图片对象来预加载
                    var img = new Image();
                    img.onload = function() {
                        // 图片加载完成后替换src
                        $this.attr('src', originalSrc);
                        $this.removeAttr('data-original');
                        
                        // 添加淡入效果
                        $this.addClass('fade-in');
                        
                        // 移除加载中状态，添加已加载状态
                        $element.removeClass(config.loadingClass).addClass(config.loadedClass);
                    };
                    img.onerror = function() {
                        // 加载失败时也移除加载状态
                        $element.removeClass(config.loadingClass).addClass(config.loadedClass);
                    };
                    img.src = originalSrc;
                }
            });
            
            // 如果没有图片需要加载，直接标记为已加载
            if ($img.length === 0) {
                $element.removeClass(config.loadingClass).addClass(config.loadedClass);
            }
        });
    }
    
    // 请求动画帧的polyfill
    var requestAnimationFrame = 
        window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        function(callback) { 
            window.setTimeout(callback, 1000 / 60); 
        };
    
    // 页面加载完成后初始化
    $(document).ready(function() {
        init();
    });
    
})(jQuery); 