#
# imports
#
import os, sys

def calculate( namespace, dir, buildtool):
    print '+++++++++++++++++++++++++++++++'
    print 'Namespace: ' + namespace
    print 'Directory: ' + dir
    output = dir + os.sep + namespace + '-deps.js'
    print 'Output: ' + output
    excludeDirs = ['lib', 'css', 'doc']
    print 'Exclude Dirs: '
    print excludeDirs
    #excludeFiles = ['.html', '.txt', '.deps']
    #print 'Exclude Files: '
    #print excludeFiles
    print 'Build Tool: ' + buildtool

    commandArgs = ''
    
    for root, dirs, files in os.walk(dir):
        
        removeDirs = list(set(excludeDirs) & set(dirs))
        for i in removeDirs:
            dirs.remove(i)
        
        for name in dirs:
            commandArgs += ' --root_with_prefix="' + os.path.join(root, name)
            real_path = os.path.relpath(root, buildtool);
            commandArgs += ' ' + real_path + '"'

    #
    # generate build command
    #
    command = buildtool
    command += commandArgs
    command += ' > ' + output

    #
    # run, forest, run
    #
    os.system( command )

    print '>> OUTPUT: ' + output