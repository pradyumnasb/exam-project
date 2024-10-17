document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const courses = document.querySelectorAll('.course');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.getAttribute('data-category');
            filterCourses(category);
        });
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        filterCourses('all', query);
    });

    function filterCourses(category, query = '') {
        courses.forEach(course => {
            const courseCategory = course.getAttribute('data-category').toLowerCase(); // Ensure it's lowercased
            const courseName = course.querySelector('h3').innerText.toLowerCase();

            const isCategoryMatch = category === 'all' || courseCategory === category.toLowerCase();
            const isSearchMatch = courseName.includes(query);

            if (isCategoryMatch && isSearchMatch) {
                course.style.display = 'block';
            } else {
                course.style.display = 'none';
            }
        });
    }
});
