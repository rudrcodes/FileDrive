'use client'
import FileBrowser from '../_components/file-browser'

const TrashPage = () => {

    return (
        <div>
            <FileBrowser title="Your Favorite Files" deletedOnly={true} />
        </div>
    )
}

export default TrashPage